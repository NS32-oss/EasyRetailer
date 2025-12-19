import mongoose from "mongoose";

const subtypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Type",
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure unique subtype name per type
subtypeSchema.index({ name: 1, type: 1 }, { unique: true });

export const Subtype = mongoose.model("Subtype", subtypeSchema);
