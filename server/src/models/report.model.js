const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    date_range: {
      start_date: {
        type: Date,
        required: true,
      },
      end_date: {
        type: Date,
        required: true,
      },
    },
    total_sales: {
      type: Number,
      required: true,
    },
    total_profit: {
      type: Number,
      required: true,
    },
    inventory_worth: {
      type: Number,
      required: true,
    },
    profit_trend: [
      {
        date: {
          type: Date,
          required: true,
        },
        profit: {
          type: Number,
          required: true,
        },
      },
    ],
    top_selling_products: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        total_sold: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;
