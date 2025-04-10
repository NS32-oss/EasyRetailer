import mongoose from "mongoose";
import dotenv from "dotenv";
import { Sales } from "../models/sales.model.js";
import { Statistics } from "../models/statistics.model.js";

// Load environment variables (if using .env)
dotenv.config({ path: './server/.env' });

// Format Date → YYYY-MM-DD
const formatDate = (date) => date.toLocaleDateString("en-CA");

const backfillDailyStatistics = async () => {
  try {
    console.log("⏳ Starting backfill...");

    const dates = await Sales.aggregate([
      {
        $project: {
          dateOnly: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $group: {
          _id: "$dateOnly",
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    console.log(`📅 Found ${dates.length} unique sale dates.`);

    for (const { _id: dateStr } of dates) {
      const start = new Date(dateStr);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);

      const stats = await Sales.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
          },
        },
        { $unwind: "$products" },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $multiply: ["$products.selling_price", "$products.quantity"],
              },
            },
            totalProfit: {
              $sum: {
                $multiply: [
                  {
                    $subtract: [
                      "$products.selling_price",
                      { $ifNull: ["$products.cost_price", 0] },
                    ],
                  },
                  "$products.quantity",
                ],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalRevenue: 1,
            totalProfit: 1,
          },
        },
      ]);

      const data = stats[0] || { totalRevenue: 0, totalProfit: 0 };

      await Statistics.findOneAndUpdate(
        { date: dateStr },
        {
          totalRevenue: data.totalRevenue,
          totalProfit: data.totalProfit,
          date: dateStr,
        },
        { upsert: true, new: true }
      );

      console.log(`✅ Saved stats for ${dateStr}: ₹${data.totalRevenue}`);
    }

    console.log("🎉 Backfill complete.");
  } catch (err) {
    console.error("❌ Error during backfill:", err);
  }
};

// 🧠 Connect and Run
const run = async () => {
  const MONGO_URI = process.env.MONGODB_URL;
  console.log("🔗 Connecting to MongoDB Atlas...", MONGO_URI);
  if (!MONGO_URI) {
    console.error("❌ Mongo URI not set in .env or code.");
    return;
  }

  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("✅ Connected to MongoDB Atlas!\n");

  await backfillDailyStatistics();
  await mongoose.disconnect();
};

run();
