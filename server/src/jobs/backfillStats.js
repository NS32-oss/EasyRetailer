import mongoose from "mongoose";
import dotenv from "dotenv";
import { Sales } from "../models/sales.model.js";
import { Return } from "../models/return.model.js";
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

      // Returns aggregated for the same day
      const returnsStats = await Return.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: ["processed", "approved"] } } },
        { $unwind: "$items" },
        { $group: { _id: null, returnsRefund: { $sum: "$items.refundAmount" }, returnsProfitImpact: { $sum: "$items.profitImpact" } } },
        { $project: { _id: 0, returnsRefund: 1, returnsProfitImpact: 1 } },
      ]);
      const r = returnsStats[0] || { returnsRefund: 0, returnsProfitImpact: 0 };
      const netRevenue = (data.totalRevenue || 0) - (r.returnsRefund || 0);
      const netProfit = (data.totalProfit || 0) - (r.returnsProfitImpact || 0);

      await Statistics.findOneAndUpdate(
        { date: dateStr },
        {
          totalRevenue: data.totalRevenue || 0,
          totalProfit: data.totalProfit || 0,
          returnsRefund: r.returnsRefund || 0,
          returnsProfitImpact: r.returnsProfitImpact || 0,
          netRevenue,
          netProfit,
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
