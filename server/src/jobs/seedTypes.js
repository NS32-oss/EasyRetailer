import mongoose from "mongoose";
import dotenv from "dotenv";
import { Type } from "../models/type.model.js";
import { Subtype } from "../models/subtype.model.js";

dotenv.config({ path: "./.env" });

const typesData = [
  {
    name: "Jeans",
    sizes: ["28", "30", "32", "34", "36", "38", "40", "42", "44", "46"],
    subtypes: ["Plain Jeans", "Fancy Jeans", "Stretch Jeans", "Tone Jeans (washed / shaded / tonal)"],
  },
  {
    name: "Trousers",
    sizes: ["28", "30", "32", "34", "36", "38", "40", "42", "44", "46"],
    subtypes: ["Cotton Plain Trouser", "Ahmedabad Fancy Cotton Trouser"],
  },
  {
    name: "Formal Pants",
    sizes: ["28", "30", "32", "34", "36", "38", "40", "42", "44", "46"],
    subtypes: ["Regular Formal Pants", "Lycra Stretch Formal Pants"],
  },
  {
    name: "T-Shirts",
    sizes: ["M", "L", "XL", "XXL", "3XL", "4XL", "5XL"],
    subtypes: [
      "Round Neck T-Shirt",
      "Collar T-Shirt (Polo)",
      "Full Sleeve Round Neck T-Shirt",
      "Full Sleeve Collar T-Shirt",
    ],
  },
  {
    name: "Shirts",
    sizes: ["M", "L", "XL", "XXL", "3XL", "4XL", "5XL"],
    subtypes: ["Plain Shirt", "Printed Shirt", "Check Shirt", "Party Wear Shirt"],
  },
  {
    name: "Cargo Pants",
    sizes: ["L", "XL", "XXL", "3XL", "4XL", "5XL"],
    subtypes: ["Cotton Six-Pocket Cargo (Bottom Rib)", "Cotton Six-Pocket Cargo (Without Rib)"],
  },
  {
    name: "Night Pants",
    sizes: [],
    subtypes: ["Lycra Night Pant", "Hosiery Night Pant"],
    subtypeSizes: {
      "Lycra Night Pant": ["L", "XL", "XXL", "3XL", "4XL"],
      "Hosiery Night Pant": ["M", "L", "XL", "XXL", "3XL", "4XL"],
    },
  },
  {
    name: "Three-Fourth Pants",
    sizes: ["L", "XL", "XXL", "3XL", "4XL", "5XL", "6XL"],
    subtypes: ["Cotton Three-Fourth Pant"],
  },
  {
    name: "Half Pants / Shorts",
    sizes: ["L", "XL", "XXL", "3XL", "4XL"],
    subtypes: ["Cotton Half Pant", "Lycra Half Pant"],
  },
  {
    name: "Underwear",
    sizes: ["M", "L", "XL", "XXL"],
    subtypes: ["V-Cut Underwear", "Full Brief", "Microman Underwear", "Printed Underwear"],
  },
  {
    name: "Vests / Baniyan",
    sizes: ["M", "L", "XL", "XXL"],
    subtypes: ["Plain White Vest", "Colored Vest", "Lining Baniyan", "Sando", "Sleeveless Vest"],
  },
  {
    name: "Socks",
    sizes: ["One Size"],
    subtypes: ["Short Length Socks", "Full Length Socks"],
  },
  {
    name: "Handkerchief",
    sizes: ["One Size"],
    subtypes: ["White Handkerchief"],
  },
  {
    name: "Tie",
    sizes: ["One Size"],
    subtypes: ["Standard Tie"],
  },
  {
    name: "Blazer",
    sizes: ["M", "L", "XL", "XXL", "3XL"],
    subtypes: ["Matte Blazer", "Fancy Party Wear Blazer"],
  },
  {
    name: "Kurta",
    sizes: ["M", "L", "XL", "XXL", "3XL", "4XL"],
    subtypes: ["Plain Kurta", "Printed Kurta", "Fancy Kurta"],
  },
  {
    name: "Pajama",
    sizes: ["M", "L", "XL", "XXL"],
    subtypes: ["White Pajama", "Cream Pajama"],
  },
  {
    name: "Dhoti",
    sizes: ["One Size"],
    subtypes: ["Pandit Style Dhoti"],
  },
  {
    name: "Balloon Pajama",
    sizes: ["M", "L", "XL", "XXL"],
    subtypes: ["Balloon Pajama"],
  },
];

const seedDatabase = async () => {
  try {
    const MONGO_URI = process.env.MONGODB_URL;
    if (!MONGO_URI) {
      console.error("❌ MONGODB_URL not set in .env");
      return;
    }

    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Type.deleteMany({});
    await Subtype.deleteMany({});
    console.log("🧹 Cleared existing types and subtypes");

    // Seed types and subtypes
    for (const typeData of typesData) {
      const typeDoc = await Type.create({
        name: typeData.name,
        sizes: typeData.sizes,
      });

      console.log(`✅ Created type: ${typeData.name}`);

      for (const subtypeName of typeData.subtypes) {
        await Subtype.create({
          name: subtypeName,
          type: typeDoc._id,
        });
      }

      console.log(`   └─ Added ${typeData.subtypes.length} subtypes`);
    }

    console.log("🎉 Seed complete!");
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
};

seedDatabase();
