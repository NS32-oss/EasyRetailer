import { Sales } from "../models/sales.model.js";
import { Return } from "../models/return.model.js";
import { Statistics } from "../models/statistics.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// Optionally pass a date (Date | string 'YYYY-MM-DD') to scope recompute to that day
export const calculateDailyStatistics = asyncHandler(async (forDate) => {
  try {
    // Define the start and end of the target day in local time
    let target;
    if (typeof forDate === "string") {
      // expecting YYYY-MM-DD
      const [y, m, d] = forDate.split("-").map((x) => parseInt(x, 10));
      target = new Date(y, (m || 1) - 1, d || 1);
    } else if (forDate instanceof Date) {
      target = new Date(forDate.getFullYear(), forDate.getMonth(), forDate.getDate());
    } else {
      const now = new Date();
      target = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const startOfDay = target;
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    // Format date as "YYYY-MM-DD"
    const dayString = startOfDay.toLocaleDateString("en-CA");
    console.log("Calculating stats for:", dayString);

    // (Optional) Log end-of-day date for debugging
    const endDateString = endOfDay.toLocaleDateString("en-CA");
    console.log("End of Day:", endDateString);

    // Aggregate gross revenue and profit from Sales for the day
    const aggregatedData = await Sales.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $unwind: "$products",
      },
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
                    "$products.cost_price",
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

    const data = aggregatedData[0] || { totalRevenue: 0, totalProfit: 0 };

    // Aggregate returns impact (processed only) for the day
    const returnsAgg = await Return.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          status: { $in: ["processed", "approved"] },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          returnsRefund: { $sum: "$items.refundAmount" },
          returnsProfitImpact: { $sum: "$items.profitImpact" },
        },
      },
      { $project: { _id: 0, returnsRefund: 1, returnsProfitImpact: 1 } },
    ]);

    const r = returnsAgg[0] || { returnsRefund: 0, returnsProfitImpact: 0 };

    const netRevenue = (data.totalRevenue || 0) - (r.returnsRefund || 0);
    const netProfit = (data.totalProfit || 0) - (r.returnsProfitImpact || 0);

    // Upsert the aggregated data into the Statistics collection using dayString as the key
    await Statistics.findOneAndUpdate(
      { date: dayString },
      {
        totalRevenue: data.totalRevenue || 0,
        totalProfit: data.totalProfit || 0,
        returnsRefund: r.returnsRefund || 0,
        returnsProfitImpact: r.returnsProfitImpact || 0,
        netRevenue,
        netProfit,
        date: dayString,
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Error calculating daily statistics:", error);
  }
});
