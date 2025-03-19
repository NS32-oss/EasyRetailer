import { Router } from "express";
import {
  createSale,
  getAllSales,
  getSaleById,
} from "../controllers/sales.controller.js";
import { requireAuth } from "@clerk/clerk-sdk-node"; // Correct import

const router = Router();

router.use(requireAuth()); // Apply verifyJWT middleware to all routes in this file

// Route to get all sales or create a new sale
router.route("/").get(getAllSales).post(createSale);

// Route to get a specific sale by its ID
router.route("/:id").get(getSaleById);

export default router;