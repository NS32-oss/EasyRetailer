import mongoose from "mongoose";

const returnSchema = new mongoose.Schema(
  {
    sale_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sales",
      required: true,
    },
    returned_products: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        return_reason: { type: String },
        refund_amount: { type: Number, default: 0 },
      },
    ],
    return_type: {
      type: String,
      enum: ["Exchange", "Refund", "Extra Payment"],
      required: true,
    },
    updated_inventory: { type: Boolean, default: false },
  },
  { timestamps:  true }
);

 export const Returns = mongoose.model("Returns", returnSchema);
