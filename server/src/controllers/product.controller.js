import asyncHandler from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";
import { Type } from "../models/type.model.js";
import { Subtype } from "../models/subtype.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import Joi from "joi";
import { generateBarcode } from "../utils/barcodeGenerator.js";
import mongoose from "mongoose";

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

// ------------------------------
// BULK PRODUCT CREATE / UPDATE
// ------------------------------
const bulkSchema = Joi.object({
  brand: Joi.string().trim().required(),
  type: Joi.string().required(), // ObjectId as string
  subtype: Joi.string().trim().allow("").optional(), // ObjectId as string or empty

  // Allow numbers OR numeric strings (Joi will convert)
  cost_price: Joi.number().positive().required(),
  unit_price: Joi.number().positive().greater(Joi.ref("cost_price")).required(),

  sizes: Joi.array()
    .items(
      Joi.object({
        size: Joi.string().trim().required(),
        quantity: Joi.number().integer().min(1).required(), // also converted
      })
    )
    .min(1)
    .required(),
});

export const createProductsBulk = asyncHandler(async (req, res) => {
  // --- FORCE COERCION ---
  try {
    req.body.cost_price = Number(req.body.cost_price);
    req.body.unit_price = Number(req.body.unit_price);

    if (Array.isArray(req.body.sizes)) {
      req.body.sizes = req.body.sizes.map((s) => ({
        size: s.size,
        quantity: Number(s.quantity),
      }));
    }
  } catch (err) {
    // coercion error
  }

  // --- JOI VALIDATION ---
  const { error, value } = bulkSchema.validate(req.body, { convert: true });

  if (error) {
    return res.status(400).json(
      new apiResponse(400, "Validation failed", {
        message: error.details[0].message,
        details: error.details,
      })
    );
  }

  // --- NORMALIZED VALUES ---
  let { brand, type, subtype, cost_price, unit_price, sizes } = value;

  // Validate type is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(type)) {
    return res.status(400).json(
      new apiResponse(400, "Validation failed", {
        message: "Invalid type ID",
      })
    );
  }

  // Verify type exists
  const typeExists = await Type.findById(type);
  if (!typeExists) {
    return res.status(400).json(
      new apiResponse(400, "Validation failed", {
        message: "Type does not exist",
      })
    );
  }

  // If subtype is provided, validate it
  if (subtype) {
    if (!mongoose.Types.ObjectId.isValid(subtype)) {
      return res.status(400).json(
        new apiResponse(400, "Validation failed", {
          message: "Invalid subtype ID",
        })
      );
    }

    const subtypeExists = await Subtype.findById(subtype);
    if (!subtypeExists) {
      return res.status(400).json(
        new apiResponse(400, "Validation failed", {
          message: "Subtype does not exist",
        })
      );
    }

    // Verify subtype belongs to the selected type
    if (subtypeExists.type.toString() !== type) {
      return res.status(400).json(
        new apiResponse(400, "Validation failed", {
          message: "Subtype does not belong to the selected type",
        })
      );
    }
  }

  brand = brand.toLowerCase();

  // --- BUILD OPS ---
  let ops = [];

  try {
    ops = await Promise.all(
      sizes.map(async ({ size, quantity }) => {
        const lowerSize = size.toLowerCase();

        return {
          updateOne: {
            filter: { brand, type, subtype: subtype || null, size: lowerSize },
            update: {
              $set: { cost_price, unit_price, type, subtype: subtype || null },
              $setOnInsert: {
                barcode: await generateBarcode(),
              },
              $inc: { quantity },
            },
            upsert: true,
          },
        };
      })
    );
  } catch (err) {
    // error generating ops
  }

  const created = [];
  const updated = [];
  const errors = [];

  try {
    const result = await Product.bulkWrite(ops, { ordered: false });

    // fetch each product
    for (const { size } of sizes) {
      const lowerSize = size.toLowerCase();

      const product = await Product.findOne({
        brand,
        type,
        subtype: subtype || null,
        size: lowerSize,
      }).populate("type subtype");

      if (!product) {
        errors.push({ size, message: "Not found after upsert" });
        continue;
      }

      const isNew = product.createdAt.getTime() === product.updatedAt.getTime();

      if (isNew)
        created.push({
          size,
          productId: product._id,
          barcode: product.barcode,
        });
      else
        updated.push({
          size,
          productId: product._id,
          barcode: product.barcode,
        });
    }

    // ... existing code ...

    return res.status(200).json(
      new apiResponse(200, "Bulk operation complete", {
        created,
        updated,
        errors,
      })
    );
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json(
        new apiResponse(400, "Duplicate key (barcode)", {
          message: error.message,
        })
      );
    }

    return res.status(500).json(
      new apiResponse(500, "Bulk operation failed", {
        message: error.message,
      })
    );
  }
});

// Create or update a product
export const createProduct = asyncHandler(async (req, res) => {
  // Validate the request body
  const { error, value } = productSchema.validate(req.body);
  if (error) {
    throw new apiError(400, error.details[0].message);
  }

  let { brand, size, type, subtype, quantity, cost_price, unit_price } = value;

  // Normalize
  brand = brand.toLowerCase();
  size = size.toLowerCase();
  type = type.toLowerCase();
  subtype = subtype?.toLowerCase() || "";

  // Check for existing product
  const existingProduct = await Product.findOneAndUpdate(
    { brand, size, type, subtype },
    {
      $set: { cost_price, unit_price, subtype },
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

  // Generate barcode for NEW product
  const barcode = await generateBarcode();

  // Create product with barcode
  const product = await Product.create({
    brand,
    size,
    type,
    subtype,
    quantity,
    cost_price,
    unit_price,
    barcode,
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

  // Retrieve products with applied filters, pagination, and sorting - OPTIMIZED with lean()
  const products = await Product.find(filter)
    .populate("type", "name")
    .populate("subtype", "name")
    .sort(sortCriteria)
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber)
    .lean();

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
  if (product.quantity === 0) {
    await product.deleteOne();
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

//get product by barcode
export const getProductByBarcode = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ barcode: req.params.barcode });
  if (!product) {
    throw new apiError(404, "Product not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, "Product fetched successfully", product));
});
