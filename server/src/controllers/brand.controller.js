// fetch all brands
import Brand from "../models/brand.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";


export const fetchBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find();
  return res
    .status(200)
    .json(new apiResponse(200, "Brands fetched successfully", brands));
});

// create brand
export const createBrand = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const brand = await Brand.create({ name });
  return res
    .status(201)
    .json(new apiResponse(201, "Brand created successfully", brand));
});
