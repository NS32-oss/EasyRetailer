import mongoose from "mongoose";

const salesSchema = new mongoose.Schema(
  {
    products: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        unit_price: {
          type: Number,
          required: true,
        }, // Original selling price before discounts
        discount: {
          type: Number,
          default: 0,
        }, // Discount on this product
        selling_price: {
          type: Number,
          required: true,
        },
        cost_price: {
          // Added field: cost price at time of sale
          type: Number,
          required: true,
        },
        brand: {
          type: String,
          required: true,
        },
        size: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
      },
    ],
    total_price: {
      type: Number,
      required: true,
    }, // Sum of all selling prices
    final_discount: {
      type: Number,
      default: 0,
    }, // Discount on the total bill
    payment_method: {
      type: String,
      enum: ["Cash", "Card", "UPI"],
      required: true,
    },
    customer_mobile: {
      type: String,
    }, // Optional for e-bill
    bill_generated: {
      type: Boolean,
      default: false,
    },
    returnStatus: {
      type: String,
      enum: ["none", "partial", "full"],
      default: "none",
    },
  },
  { timestamps: true }
);

// Indexes for performance
salesSchema.index({ sale_date: -1 });
salesSchema.index({ productId: 1 });
salesSchema.index({ barcode: 1 });
salesSchema.index({ returnStatus: 1 });
salesSchema.index({ sale_date: -1, returnStatus: 1 });

export const Sales = mongoose.model("Sales", salesSchema);
