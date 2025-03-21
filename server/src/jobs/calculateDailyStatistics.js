// src/jobs/calculateDailyStatistics.js
import { Sales } from "../models/sales.model.js";
import { Statistics } from "../models/statistics.model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const calculateDailyStatistics = asyncHandler(async () => {
  try {
    // Define the start and end of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Aggregate revenue and profit for today
    const aggregatedData = await Sales.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lte: endOfDay },
        },
      },
      {
        $unwind: "$products"
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $multiply: ["$products.selling_price", "$products.quantity"] }
          },
          totalProfit: {
            $sum: {
              $multiply: [
                { $subtract: ["$products.selling_price", "$products.cost_price"] },
                "$products.quantity"
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalProfit: 1
        }
      }
    ]);

    const data = aggregatedData[0] || { totalRevenue: 0, totalProfit: 0 };

    // Upsert the aggregated data into the Statistics collection for today
    await Statistics.findOneAndUpdate(
      { date: today },
      { totalRevenue: data.totalRevenue, totalProfit: data.totalProfit },
      { upsert: true, new: true }
    );

    console.log(
      `Daily Statistics saved: Revenue = ${data.totalRevenue}, Profit = ${data.totalProfit}`
    );
  } catch (error) {
    console.error("Error calculating daily statistics:", error);
  }
});
