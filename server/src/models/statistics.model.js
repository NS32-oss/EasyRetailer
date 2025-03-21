import mongoose from "mongoose";

const statisticsSchema = new mongoose.Schema(
  {
    // The date for which the statistics apply (set as unique to have one document per day)
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    // Sum of all total_price values from sales for the day
    totalRevenue: {
      type: Number,
      required: true,
    },
    // Count of sales transactions (number of sales documents)
    totalProfit: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const Statistics = mongoose.model("Statistics", statisticsSchema);
