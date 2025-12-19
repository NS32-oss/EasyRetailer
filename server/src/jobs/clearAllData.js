import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "../models/product.model.js";
import { Sales } from "../models/sales.model.js";
import { Return } from "../models/return.model.js";
import { Statistics } from "../models/statistics.model.js";
import Brand from "../models/brand.model.js";
import { Type } from "../models/type.model.js";
import { Subtype } from "../models/subtype.model.js";
import { Counter } from "../models/barcodeCounter.model.js";

dotenv.config({ path: "./.env" });

const clearAllData = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      console.error("❌ MONGODB_URL not set in .env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");
    console.log("\n⚠️  WARNING: This will delete ALL data from the following collections:");
    console.log("   - Products");
    console.log("   - Sales");
    console.log("   - Returns");
    console.log("   - Statistics");
    console.log("   - Brands");
    console.log("   - Barcode Counters");
    console.log("\n📦 Types and Subtypes will be KEPT (seeded data)");
    console.log("\n🔄 Starting cleanup in 3 seconds...\n");

    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Delete all data
    const productResult = await Product.deleteMany({});
    console.log(`🗑️  Deleted ${productResult.deletedCount} products`);

    const salesResult = await Sales.deleteMany({});
    console.log(`🗑️  Deleted ${salesResult.deletedCount} sales records`);

    const returnResult = await Return.deleteMany({});
    console.log(`🗑️  Deleted ${returnResult.deletedCount} return records`);

    const statsResult = await Statistics.deleteMany({});
    console.log(`🗑️  Deleted ${statsResult.deletedCount} statistics records`);

    const brandResult = await Brand.deleteMany({});
    console.log(`🗑️  Deleted ${brandResult.deletedCount} brands`);

    const barcodeResult = await Counter.deleteMany({});
    console.log(`🗑️  Deleted ${barcodeResult.deletedCount} barcode counters`);

    // Count remaining types and subtypes
    const typeCount = await Type.countDocuments();
    const subtypeCount = await Subtype.countDocuments();
    console.log(`\n✅ Kept ${typeCount} types and ${subtypeCount} subtypes`);

    console.log("\n🎉 Database cleanup complete! Ready for fresh data.");
    console.log("💡 Tip: Restart your server to ensure clean state.\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing data:", error);
    process.exit(1);
  }
};

clearAllData();
