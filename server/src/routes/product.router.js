import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { requireAuth } from "@clerk/clerk-sdk-node"; // Correct import

const router = Router();

router.use(requireAuth()); // Apply verifyJWT middleware to all routes in this file

// Route to get all products or create a new product
router
  .route("/")
  .get(getAllProducts) // Retrieve all products (with filtering, pagination, etc.)
  .post(createProduct); // Create a new product

// Route to get, update, or delete a single product by ID
router
  .route("/:id")
  .get(getProductById) // Retrieve a product by its ID
  .patch(updateProduct) // Update a product by its ID
  .delete(deleteProduct); // Delete a product by its ID

export default router;