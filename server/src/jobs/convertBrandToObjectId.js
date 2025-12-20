import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../db/index.js";
import { Product } from "../models/product.model.js";

dotenv.config();

async function run() {
  try {
    await connectDB();

    const result = await Product.updateMany(
      { brand: { $type: "string" } },
      [
        {
          $set: {
            brand: { $toObjectId: "$brand" },
          },
        },
      ]
    );

    console.log("Brand migration complete", {
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });
  } catch (err) {
    console.error("Brand migration failed", err);
  } finally {
    await mongoose.connection.close();
  }
}

run();
