import { Sales } from "../models/sales.model.js";
import { Statistics } from "../models/statistics.model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const calculateDailyStatistics = asyncHandler(async () => {
  try {
    // Define the start and end of today in local time
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Format today's date as "YYYY-MM-DD" using local time with the "en-CA" locale
    const todayString = today.toLocaleDateString("en-CA");
    console.log("Today:", todayString);

    // (Optional) Log end-of-day date for debugging
    const endDateString = endOfDay.toLocaleDateString("en-CA");
    console.log("End of Day:", endDateString);

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

    // Upsert the aggregated data into the Statistics collection using todayString as the key
    await Statistics.findOneAndUpdate(
      { date: todayString },
      { totalRevenue: data.totalRevenue, totalProfit: data.totalProfit, date: todayString },
      { upsert: true, new: true }
    );

    console.log(
      `Daily Statistics saved for ${todayString}: Revenue = ${data.totalRevenue}, Profit = ${data.totalProfit}`
    );
  } catch (error) {
    console.error("Error calculating daily statistics:", error);
  }
});
