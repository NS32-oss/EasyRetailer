import { Router } from "express";
import {
  createSale,
  getAllSales,
  getSaleById,
} from "../controllers/sales.controller.js";

const router = Router();

router.use(clerkExpressRequireAuth()); // Apply verifyJWT middleware to all routes in this file

// Route to get all sales or create a new sale
router.route("/").get(getAllSales).post(createSale);

// Route to get a specific sale by its ID
router.route("/:id").get(getSaleById);

export default router;
