import asyncHandler from "../utils/asyncHandler.js";
import { Statistics } from "../models/statistics.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";

export const getStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new apiError(400, "Start date and end date are required.");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // Retrieve statistics documents in the specified date range, sorted by date ascending
  const stats = await Statistics.find({
    date: { $gte: start, $lte: end },
  }).sort({ date: 1 });

  // Optionally, calculate cumulative revenue and profit for the period
  const totalRevenue = stats.reduce((sum, stat) => sum + stat.totalRevenue, 0);
  const totalProfit = stats.reduce((sum, stat) => sum + stat.totalProfit, 0);

  return res.status(200).json(
    new apiResponse(200, "Statistics fetched successfully", {
      stats,
      cumulative: {
        totalRevenue,
        totalProfit,
      },
    })
  );
});
