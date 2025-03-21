// src/jobs/scheduleDailyStatistics.js
import cron from "node-cron";
import { calculateDailyStatistics } from "./calculateDailyStatistics.js";

// Schedule the job to run every day at midnight
cron.schedule("0 0 * * *", () => {
  console.log("Running daily statistics job at midnight");
  calculateDailyStatistics();
});
