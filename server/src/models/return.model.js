import mongoose from "mongoose";

const returnItemSchema = new mongoose.Schema(
  {
    saleProductId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // _id of the line item inside sale.products
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    requestedQty: {
      type: Number,
      required: true,
      min: 1,
    },
    approvedQty: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    unitPrice: {
      type: Number,
      required: true, // selling price per unit actually paid
    },
    refundAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    profitImpact: {
      // Impact on profit for this returned item (positive number to subtract from profit)
      type: Number,
      required: true,
      default: 0,
    },
    reason: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const returnSchema = new mongoose.Schema(
  {
    sale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sales",
      required: true,
    },
    items: {
      type: [returnItemSchema],
      validate: (arr) => Array.isArray(arr) && arr.length > 0,
    },
    totalRefund: {
      type: Number,
      required: true,
      default: 0,
    },
    totalProfitImpact: {
      // Sum of profitImpact for all items
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "processed"],
      default: "processed",
    },
    reason: {
      type: String,
      default: "",
    },
    note: {
      type: String,
    },
    updatedInventory: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for performance
returnSchema.index({ saleId: 1 });
returnSchema.index({ return_date: -1 });
returnSchema.index({ productId: 1 });
returnSchema.index({ return_date: -1, saleId: 1 });

export const Return = mongoose.model("Return", returnSchema);
