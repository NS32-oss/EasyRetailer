import asyncHandler from "../utils/asyncHandler.js";
import { Statistics } from "../models/statistics.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";

export const getStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate, groupBy } = req.query;

  if (!startDate || !endDate) {
    throw new apiError(400, "Start date and end date are required.");
  }

  // Convert the query dates to "YYYY-MM-DD" strings using the "en-CA" locale
  const startString = new Date(startDate).toLocaleDateString("en-CA");
  const endString = new Date(endDate).toLocaleDateString("en-CA");

  if (groupBy === "Monthly") {
    const now = new Date();
    const past12MonthsStart = new Date(
      now.getFullYear(),
      now.getMonth() - 11,
      1
    ).toLocaleDateString("en-CA");
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).toLocaleDateString("en-CA");

    const aggregatedData = await Statistics.aggregate([
      {
        $match: {
          date: { $gte: past12MonthsStart, $lte: currentMonthEnd },
        },
      },
      {
        $group: {
          _id: {
            year: { $substr: ["$date", 0, 4] },
            month: { $substr: ["$date", 5, 2] },
          },
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

    // Create an array of size 12 with default values
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      year: new Date(now.getFullYear(), now.getMonth() - 11 + i)
        .getFullYear()
        .toString(),
      month: (
        new Date(now.getFullYear(), now.getMonth() - 11 + i).getMonth() + 1
      )
        .toString()
        .padStart(2, "0"),
      totalRevenue: 0,
      totalProfit: 0,
    }));

    // Fill the monthlyData array with the aggregated data
    aggregatedData.forEach((data) => {
      const index = monthlyData.findIndex(
        (item) => item.year === data.year && item.month === data.month
      );
      if (index !== -1) {
        monthlyData[index].totalRevenue = data.totalRevenue;
        monthlyData[index].totalProfit = data.totalProfit;
      }
    });

    console.log("Monthly Aggregated Data:", monthlyData);
    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          "Monthly statistics fetched successfully",
          monthlyData
        )
      );
  } else if (groupBy === "Yearly") {
    const now = new Date();
    const past10YearsStart = new Date(
      now.getFullYear() - 9,
      0,
      1
    ).toLocaleDateString("en-CA");
    const currentYearEnd = new Date(
      now.getFullYear(),
      11,
      31
    ).toLocaleDateString("en-CA");

    const aggregatedData = await Statistics.aggregate([
      {
        $match: {
          date: { $gte: past10YearsStart, $lte: currentYearEnd },
        },
      },
      {
        $group: {
          _id: { year: { $substr: ["$date", 0, 4] } },
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

    // Create an array of size 10 with default values
    const yearlyData = Array.from({ length: 10 }, (_, i) => ({
      year: (now.getFullYear() - 9 + i).toString(),
      totalRevenue: 0,
      totalProfit: 0,
    }));

    // Fill the yearlyData array with the aggregated data
    aggregatedData.forEach((data) => {
      const index = yearlyData.findIndex((item) => item.year === data.year);
      if (index !== -1) {
        yearlyData[index].totalRevenue = data.totalRevenue;
        yearlyData[index].totalProfit = data.totalProfit;
      }
    });

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          "Yearly statistics fetched successfully",
          yearlyData
        )
      );
  } else if (groupBy === "Daily") {
    const now = new Date();
    const currentMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toLocaleDateString("en-CA");
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).toLocaleDateString("en-CA");

    const aggregatedData = await Statistics.aggregate([
      {
        $match: {
          date: { $gte: currentMonthStart, $lte: currentMonthEnd },
        },
      },
      {
        $group: {
          _id: {
            year: { $substr: ["$date", 0, 4] },
            month: { $substr: ["$date", 5, 2] },
            day: { $substr: ["$date", 8, 2] },
          },
          totalRevenue: { $sum: "$totalRevenue" },
          totalProfit: { $sum: "$totalProfit" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          day: "$_id.day",
          totalRevenue: 1,
          totalProfit: 1,
        },
      },
    ]);

    // Create an array with the number of days up to the current date
    const daysInMonth = now.getDate();
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
      year: now.getFullYear().toString(),
      month: (now.getMonth() + 1).toString().padStart(2, "0"),
      day: (i + 1).toString().padStart(2, "0"),
      totalRevenue: 0,
      totalProfit: 0,
    }));

    // Fill the dailyData array with the aggregated data
    aggregatedData.forEach((data) => {
      const index = dailyData.findIndex(
        (item) =>
          item.year === data.year &&
          item.month === data.month &&
          item.day === data.day
      );
      if (index !== -1) {
        dailyData[index].totalRevenue = data.totalRevenue;
        dailyData[index].totalProfit = data.totalProfit;
      }
    });

    return res
      .status(200)
      .json(
        new apiResponse(200, "Daily statistics fetched successfully", dailyData)
      );
  } else {
    // Default: return daily statistics documents as they are stored.
    const stats = await Statistics.find({
      date: { $gte: startString, $lte: endString },
    }).sort({ date: 1 });

    if (!stats || stats.length === 0) {
      console.log("No statistics found for the specified date range");
    }

    return res
      .status(200)
      .json(
        new apiResponse(200, "Daily statistics fetched successfully", stats)
      );
  }
});
