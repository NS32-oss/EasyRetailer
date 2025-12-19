import mongoose from "mongoose";

const statisticsSchema = new mongoose.Schema(
  {
    // The date for which the statistics apply (set as unique to have one document per day)
    date: {
      type: String,
      required: true,
    },
    // Sum of all total_price values from sales for the day
    totalRevenue: {
      type: Number,
      required: true,
      default: 0,
    },
    // Sum of profit from sales for the day (gross, before returns)
    totalProfit: {
      type: Number,
      required: true,
      default: 0,
    },
    // Sum of refunds from processed returns on this day
    returnsRefund: {
      type: Number,
      required: true,
      default: 0,
    },
    // Sum of profit impact from processed returns on this day
    returnsProfitImpact: {
      type: Number,
      required: true,
      default: 0,
    },
    // Net metrics = sales minus returns (for operational dashboards)
    netRevenue: {
      type: Number,
      required: true,
      default: 0,
    },
    netProfit: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Statistics = mongoose.model("Statistics", statisticsSchema);
