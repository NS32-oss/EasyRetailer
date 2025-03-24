import asyncHandler from "../utils/asyncHandler.js";
import { Sales } from "../models/sales.model.js";
import { Product } from "../models/product.model.js"; // Import the Product model
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { calculateDailyStatistics } from "../jobs/calculateDailyStatistics.js";
import mongoose from "mongoose";
// import twilio from "twilio";

export const createSale = asyncHandler(async (req, res) => {
  const {
    products, // Array of products { product_id, quantity, unit_price, discount, selling_price }
    final_discount, // Final discount on total bill (optional)
    payment_method, // "Cash", "Card", or "UPI"
    customer_mobile, // Optional for e-bill
    bill_generated, // Optional flag; default is false
  } = req.body;

  // Validate required fields
  if (!products || !Array.isArray(products) || products.length === 0) {
    throw new apiError(400, "At least one product is required for a sale.");
  }
  if (!payment_method) {
    throw new apiError(400, "Payment method is required.");
  }

  // Calculate the total price dynamically based on each product's selling price and quantity.
  let computedTotalPrice = 0;
  products.forEach((product) => {
    computedTotalPrice += product.selling_price * product.quantity;
  });

  // Apply the final discount if provided
  computedTotalPrice -= final_discount || 0;

  // Create the sale transaction document
  const sale = await Sales.create({
    products,
    total_price: computedTotalPrice,
    final_discount,
    payment_method,
    customer_mobile,
    bill_generated,
  });

  // Update inventory: For each product sold, subtract the sold quantity from inventory
  for (const item of products) {
    const productRecord = await Product.findById(item.product_id);
    if (!productRecord) {
      throw new apiError(404, `Product with id ${item.product_id} not found`);
    }
    // Optional: Check if there is enough quantity available
    if (productRecord.quantity < item.quantity) {
      throw new apiError(
        400,
        `Not enough inventory for product ${item.product_id}`
      );
    }
    productRecord.quantity -= item.quantity;

    // // If the updated quantity is 0, remove the product from the database
    // if (productRecord.quantity === 0) {
    //   await productRecord.deleteOne();
    // } else {
    //   await productRecord.save();
    // }
  }
  calculateDailyStatistics();
  console.log(sale);
  return res
    .status(201)
    .json(
      new apiResponse(
        201,
        "Sale created and inventory updated successfully",
        sale
      )
    );
});

// Get all sales transactions
export const getAllSales = asyncHandler(async (req, res) => {
  // Extract query parameters with defaults
  const {
    page = 1,
    limit = 100,
    query,
    sortBy,
    sortType = "desc",
    payment_method,
    startDate,
    endDate,
  } = req.query;

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  // Build filter object
  const filter = {};

  // Filter by search query against customer_mobile (using regex)
  if (query) {
    filter.customer_mobile = { $regex: query, $options: "i" };
  }

  // Filter by payment method if provided
  if (payment_method) {
    filter.payment_method = payment_method;
  }

  // Filter by date range if both startDate and endDate are provided
  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  // Build sort criteria. If not specified, sort by createdAt descending.
  let sortCriteria = {};
  if (sortBy) {
    sortCriteria[sortBy] = sortType === "desc" ? -1 : 1;
  } else {
    sortCriteria = { createdAt: -1 };
  }

  // Get the total count of sales matching the filter
  const totalItems = await Sales.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / limitNumber);

  // Retrieve sales with filters, pagination, and sorting
  const sales = await Sales.find(filter)
    .sort(sortCriteria)
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);

  // Respond with sales and pagination info
  return res.status(200).json(
    new apiResponse(200, "Sales fetched successfully", {
      sales,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalItems,
      },
    })
  );
});

// Get a single sale transaction by ID
export const getSaleById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate the saleId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new apiError(400, "Invalid sale ID");
  }

  const sale = await Sales.findById(id);
  if (!sale) {
    throw new apiError(404, "Sale not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, "Sale fetched successfully", sale));
});

//calculate revenue for any time period
export const getRevenue = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // Build filter object
  const filter = {};

  // Filter by date range if both startDate and endDate are provided
  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  // Get the total revenue for the given time period
  const sales = await Sales.find(filter);
  let totalRevenue = 0;
  sales.forEach((sale) => {
    totalRevenue += sale.total_price;
  });

  return res
    .status(200)
    .json(
      new apiResponse(200, "Revenue calculated successfully", totalRevenue)
    );
});

//http://localhost:8000/api/v1/sales/${saleId}/generate-bill

// Generate a bill for a sale transaction
export const generateBill = asyncHandler(async (req, res) => {
  const { id, contact_number } = req.params;

  // Validate the sale ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new apiError(400, "Invalid sale ID");
  }

  const sale = await Sales.findById(id);
  if (!sale) {
    throw new apiError(404, "Sale not found");
  }

  // Update the bill_generated flag to true

  // Setup Twilio client using environment variables
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = twilio(accountSid, authToken);

  // Prepare a simple test message for the bill
  const smsBody = "Hello World, your bill is generated!";

  try {
    const message = await client.messages.create({
      body: smsBody,
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
      to: contact_number,
    });
    console.log("SMS sent:", message.sid);
    sale.bill_generated = true;
    sale.customer_mobile = contact_number;
    await sale.save();
  } catch (smsError) {
    console.error("Error sending SMS:", smsError);
    // Optionally, you can choose to throw an error or continue
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, "Bill generated and SMS sent successfully", sale)
    );
});
