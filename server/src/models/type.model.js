import mongoose from "mongoose";

const typeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Default sizes for this type (e.g., waist for pants, M/L/XL for shirts)
    sizes: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const Type = mongoose.model("Type", typeSchema);
