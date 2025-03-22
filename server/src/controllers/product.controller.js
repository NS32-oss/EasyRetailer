import asyncHandler from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import Joi from "joi";

// Define the validation schema using Joi
const productSchema = Joi.object({
  brand: Joi.string().trim().required(),
  size: Joi.string().trim().required(),
  colour: Joi.string().trim().allow("").optional(),
  type: Joi.string().trim().required(),
  subtype: Joi.string().trim().allow("").optional(),
  quantity: Joi.number().integer().min(1).required(),
  cost_price: Joi.number().positive().required(),
  unit_price: Joi.number().positive().greater(Joi.ref("cost_price")).required(),
});

// Create or update a product
export const createProduct = asyncHandler(async (req, res) => {
  // Validate the request body
  const { error, value } = productSchema.validate(req.body);
  if (error) {
    throw new apiError(400, error.details[0].message);
  }

  let { brand, size, colour, type, subtype, quantity, cost_price, unit_price } =
    value;

  // Convert to lowercase for case-insensitive matching
  brand = brand.toLowerCase();
  size = size.toLowerCase();
  type = type.toLowerCase();
  subtype = subtype.toLowerCase();
  colour = colour.toLowerCase();

  // Check for existing product and update atomically
  const existingProduct = await Product.findOneAndUpdate(
    { brand, size, type },
    {
      $set: { cost_price, unit_price, colour, subtype },
      $inc: { quantity },
    },
    { new: true }
  );

  if (existingProduct) {
    return res
      .status(200)
      .json(
        new apiResponse(200, "Product updated successfully", existingProduct)
      );
  }

  // Create a new product
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
