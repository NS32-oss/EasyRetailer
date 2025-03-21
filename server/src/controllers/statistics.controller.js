import asyncHandler from "../utils/asyncHandler.js";
import { Statistics } from "../models/statistics.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";

export const getStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate, groupBy } = req.query;

  if (!startDate || !endDate) {
    throw new apiError(400, "Start date and end date are required.");
  }

  const startString = new Date(startDate).toLocaleDateString("en-CA");
  const endString = new Date(endDate).toLocaleDateString("en-CA");

  if (groupBy === "Monthly") {
    // Group by month: e.g., each document represents a month with aggregated values.
    const aggregatedData = await Statistics.aggregate([
      {
        $match: {
          date: { $gte: startString, $lte: endString },
        },
      },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          totalRevenue: { $sum: "$totalRevenue" },
          totalProfit: { $sum: "$totalProfit" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          totalRevenue: 1,
          totalProfit: 1,
        },
      },
    ]);
    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          "Monthly statistics fetched successfully",
          aggregatedData
        )
      );
  } else if (groupBy === "Yearly") {
    // Group by year: e.g., each document represents a year with aggregated values.
    const aggregatedData = await Statistics.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { year: { $year: "$date" } },
          totalRevenue: { $sum: "$totalRevenue" },
          totalProfit: { $sum: "$totalProfit" },
        },
      },
      {
        $sort: { "_id.year": 1 },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          totalRevenue: 1,
          totalProfit: 1,
        },
      },
    ]);
    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          "Yearly statistics fetched successfully",
          aggregatedData
        )
      );
  } else {
    // Default: return daily statistics documents as they are stored.
    const stats = await Statistics.find({
      date: { $gte: startString, $lte: endString },
    }).sort({ date: 1 });

    if (!stats || stats.length === 0) {
      console.log("No statistics found for the specified date range");
      // throw new apiError(
      //   404,
      //   "No statistics found for the specified date range."
      // );
    }

    return res
      .status(200)
      .json(
        new apiResponse(200, "Daily statistics fetched successfully", stats)
      );
  }
});
