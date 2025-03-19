const mongoose = require("mongoose");

const salesTransactionSchema = new mongoose.Schema(
  {
    products: [
      {
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        unit_price: { type: Number, required: true }, // Original selling price before discounts
        discount: { type: Number, default: 0 }, // Discount on this product
        selling_price: { type: Number, required: true }, // Final selling price after discount
      },
    ],
    total_price: { type: Number, required: true }, // Sum of all selling prices
    final_discount: { type: Number, default: 0 }, // Discount on the total bill
    payment_method: { type: String, enum: ["Cash", "Card", "UPI"], required: true },
    customer_mobile: { type: String }, // Optional for e-bill
    bill_generated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const SalesTransaction = mongoose.model("SalesTransaction", salesTransactionSchema);
module.exports = SalesTransaction;
