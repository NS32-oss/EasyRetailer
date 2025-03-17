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
    colour: {
      type: String,
    },
    type: {
      type: String,
      required: true,
    },
    subtype: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
    },
    cost_price: {
      type: Number,
      required: true,
    },
    sales_price: {
      type: Number,
      required: true,
    },
    barcode: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Pre-save hook to auto-generate a barcode if not provided.
productSchema.pre("save", function (next) {
  if (!this.barcode) {
    // This is a simple example; consider a more robust approach in production.
    this.barcode = `${this.brand}-${Date.now()}`;
  }
  next();
});

export const Product = mongoose.model("Product", productSchema);
