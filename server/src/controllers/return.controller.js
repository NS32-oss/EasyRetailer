import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { Sales } from "../models/sales.model.js";
import { Product } from "../models/product.model.js";
import { Return } from "../models/return.model.js";
import { calculateDailyStatistics } from "../jobs/calculateDailyStatistics.js";

// Helper to round currency to 2 decimals
const round2 = (value) => Math.round(value * 100) / 100;

// Build a map of already approved/processed returns per sale line
const getPreviouslyReturnedCounts = async (saleId) => {
  const priorReturns = await Return.find({
    sale: saleId,
    status: { $in: ["approved", "processed"] },
  });

  const returnedCount = {};
  for (const ret of priorReturns) {
    for (const item of ret.items) {
      const key = item.saleProductId.toString();
      returnedCount[key] = (returnedCount[key] || 0) + (item.approvedQty || 0);
    }
  }
  return returnedCount;
};

export const createReturn = asyncHandler(async (req, res) => {
  const { sale_id, products = [], reason = "" } = req.body;

  if (!sale_id || !mongoose.Types.ObjectId.isValid(sale_id)) {
    throw new apiError(400, "Invalid sale id");
  }

  if (!Array.isArray(products) || products.length === 0) {
    throw new apiError(400, "No products provided for return");
  }

  const sale = await Sales.findById(sale_id);
  if (!sale) {
    throw new apiError(404, "Sale not found");
  }

  // Map sale line items by their _id for quick lookup
  const saleItemMap = new Map();
  for (const p of sale.products) {
    saleItemMap.set(p._id.toString(), p);
  }

  // Track previously returned quantities per sale line
  const returnedCount = await getPreviouslyReturnedCounts(sale_id);

  const items = products.map((p) => {
    const saleProductId = (p._id || p.saleProductId || p.sale_product_id || "").toString();
    if (!saleProductId) {
      throw new apiError(400, "Missing sale product reference (_id)");
    }

    const saleItem = saleItemMap.get(saleProductId);
    if (!saleItem) {
      throw new apiError(400, "Sale product not found for this sale");
    }

    const requestedQty = Number(p.return_quantity || p.requestedQty || p.quantity || 0);
    if (!Number.isFinite(requestedQty) || requestedQty <= 0) {
      throw new apiError(400, "Invalid return quantity");
    }

    const alreadyReturned = returnedCount[saleProductId] || 0;
    const remaining = saleItem.quantity - alreadyReturned;
    if (requestedQty > remaining) {
      throw new apiError(
        400,
        `Return quantity exceeds remaining available for this item (remaining: ${remaining})`
      );
    }

    const unitPrice = saleItem.selling_price / saleItem.quantity;
    const refundAmount = round2(unitPrice * requestedQty);
    const perUnitCost = Number.isFinite(saleItem.cost_price) ? saleItem.cost_price : 0;
    const profitImpact = round2((unitPrice - perUnitCost) * requestedQty);

    return {
      saleProductId,
      product: saleItem.product_id,
      requestedQty,
      approvedQty: requestedQty, // auto-approve for now
      unitPrice,
      refundAmount,
        profitImpact,
      reason: p.reason || reason || "",
    };
  });

  const totalRefund = round2(items.reduce((sum, item) => sum + item.refundAmount, 0));
  const totalProfitImpact = round2(items.reduce((sum, item) => sum + item.profitImpact, 0));

  const newReturn = await Return.create({
    sale: sale_id,
    items,
    totalRefund,
    totalProfitImpact,
    status: "processed", // instantly process; adjust if you want manual approval
    reason,
    updatedInventory: false,
  });

  // Update inventory by adding back the approved quantities
  for (const item of items) {
    const updated = await Product.findByIdAndUpdate(
      item.product,
      { $inc: { quantity: item.approvedQty } },
      { new: true }
    );

    if (!updated) {
      const saleItem = saleItemMap.get(item.saleProductId);
      await Product.create({
        _id: item.product,
        brand: saleItem?.brand || "",
        size: saleItem?.size || "",
        type: saleItem?.type || "",
        subtype: saleItem?.subtype,
        quantity: item.approvedQty,
        cost_price: saleItem?.cost_price ?? saleItem?.unit_price ?? item.unitPrice,
        unit_price: saleItem?.unit_price ?? item.unitPrice,
        barcode: saleItem?.barcode,
      });
    }
  }

  newReturn.updatedInventory = true;
  await newReturn.save();

   // Update sale return status (none/partial/full)
  const returnedCountAfter = await getPreviouslyReturnedCounts(sale_id);
  let allReturned = true;
  for (const saleItem of sale.products) {
    const already = returnedCountAfter[saleItem._id.toString()] || 0;
    const remaining = saleItem.quantity - already;
    if (remaining > 0) {
      allReturned = false;
      break;
    }
  }

  sale.returnStatus = allReturned ? "full" : "partial";
  await sale.save();

  // Recompute statistics for return date only
  const returnDateStr = newReturn.createdAt
    ? new Date(newReturn.createdAt).toLocaleDateString("en-CA")
    : new Date().toLocaleDateString("en-CA");
  await calculateDailyStatistics(returnDateStr);

  return res
    .status(201)
    .json(new apiResponse(201, "Return processed successfully", { return: newReturn }));
});

export const listReturns = asyncHandler(async (req, res) => {
  const { sale_id } = req.query;
  const filter = sale_id ? { sale: sale_id } : {};

  const returns = await Return.find(filter).sort({ createdAt: -1 });
  return res.status(200).json(new apiResponse(200, "Returns fetched", { returns }));
});
