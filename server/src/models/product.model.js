import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Type",
      required: true,
    },
    subtype: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subtype",
    },
    quantity: {
      type: Number,
      required: true,
    },
    cost_price: {
      type: Number,
      required: true,
    },
    unit_price: {
      type: Number,
      required: true,
    },
    barcode: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// TEXT SEARCH INDEX (UNCHANGED)
productSchema.index({
  brand: "text",
  type: "text",
  subtype: "text",
  colour: "text",
});

export const Product = mongoose.model("Product", productSchema);
