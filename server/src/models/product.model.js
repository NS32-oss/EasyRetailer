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

// Generate unique barcode before saving
productSchema.pre("save", async function (next) {
  if (!this.barcode) {
    let isUnique = false;
    let newBarcode;

    while (!isUnique) {
      newBarcode = `P${Date.now().toString().slice(-10)}`; // Example: P + last 10 digits of timestamp
      const existing = await mongoose.models.Product.findOne({
        barcode: newBarcode,
      });
      if (!existing) {
        isUnique = true;
      }
    }
    this.barcode = newBarcode;
  }
  next();
});

export const Product = mongoose.model("Product", productSchema);
