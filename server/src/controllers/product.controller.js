import asyncHandler from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";

// Create a new product
export const createProduct = asyncHandler(async (req, res) => {
  const {
    brand,
    size,
    colour,
    type,
    subtype,
    quantity,
    cost_price,
    unit_price,
  } = req.body;

  // Validate required fields
  if (!brand || !size || !type || !quantity || !cost_price || !unit_price) {
    throw new apiError(
      400,
      "Missing required fields: brand, size, type, quantity, cost_price, or unit_price"
    );
  }

  // Create the product. The pre-save hook will generate the barcode if it's not provided.
  const product = await Product.create({
    brand,
    size,
    colour,
    type,
    subtype,
    quantity,
    cost_price,
    unit_price,
  });

  return res
    .status(201)
    .json(new apiResponse(201, "Product created successfully", product));
});

// Retrieve all products
export const getAllProducts = asyncHandler(async (req, res) => {
  // Extract query parameters with default values
  const {
    page = 1,
    limit = 100,
    query,
    sortBy,
    sortType = "desc",
    brand,
    type,
  } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  // Build filter object
  const filter = {};
  // If a search query is provided and text indexes are set up, search the text fields.
  if (query) {
    filter.$text = { $search: query };
  }
  // Optionally filter by brand and type if provided
  if (brand) {
    filter.brand = brand;
  }
  if (type) {
    filter.type = type;
  }

  // Build sort criteria. If no sortBy is provided, sort by creation date descending.
  let sortCriteria = {};
  if (sortBy) {
    sortCriteria[sortBy] = sortType === "desc" ? -1 : 1;
  } else {
    sortCriteria = { createdAt: -1 };
  }

  // Count the total number of products matching the filter
  const totalItems = await Product.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / limitNumber);

  // Retrieve products with applied filters, pagination, and sorting
  const products = await Product.find(filter)
    .sort(sortCriteria)
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);

  // Return the result using the custom API response format
  return res.status(200).json(
    new apiResponse(200, "All products fetched successfully", {
      products,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalItems,
      },
    })
  );
});

// Retrieve a single product by ID
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new apiError(404, "Product not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, "Product fetched successfully", product));
});

// Update a product by ID
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new apiError(404, "Product not found");
  }
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  return res
    .status(200)
    .json(new apiResponse(200, "Product updated successfully", updatedProduct));
});

// Delete a product by ID
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new apiError(404, "Product not found");
  }
  await Product.findByIdAndDelete(req.params.id);
  return res
    .status(200)
    .json(new apiResponse(200, "Product deleted successfully", {}));
});
