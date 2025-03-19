import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

const router = Router();

router.use(clerkExpressRequireAuth()); // Apply verifyJWT middleware to all routes in this file

// Route to get all products or create a new product
router
  .route("/")
  .get(getProducts) // Retrieve all products (with filtering, pagination, etc.)
  .post(createProduct); // Create a new product

// Route to get, update, or delete a single product by ID
router
  .route("/:id")
  .get(getProductById) // Retrieve a product by its ID
  .patch(updateProduct) // Update a product by its ID
  .delete(deleteProduct); // Delete a product by its ID

export default router;
