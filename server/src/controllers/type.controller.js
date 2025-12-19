import asyncHandler from "../utils/asyncHandler.js";
import { Type } from "../models/type.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";

export const getAllTypes = asyncHandler(async (req, res) => {
  const types = await Type.find().sort({ name: 1 });
  return res
    .status(200)
    .json(new apiResponse(200, "Types fetched successfully", types));
});

export const getTypeById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const type = await Type.findById(id);

  if (!type) {
    throw new apiError(404, "Type not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Type fetched successfully", type));
});

export const createType = asyncHandler(async (req, res) => {
  const { name, sizes = [] } = req.body;

  if (!name || !name.trim()) {
    throw new apiError(400, "Type name is required");
  }

  const existingType = await Type.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
  });

  if (existingType) {
    throw new apiError(400, "Type already exists");
  }

  const newType = await Type.create({
    name: name.trim(),
    sizes,
  });

  return res
    .status(201)
    .json(new apiResponse(201, "Type created successfully", newType));
});

export const updateType = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, sizes } = req.body;

  const type = await Type.findById(id);
  if (!type) {
    throw new apiError(404, "Type not found");
  }

  if (name) {
    const existingType = await Type.findOne({
      _id: { $ne: id },
      name: { $regex: `^${name}$`, $options: "i" },
    });
    if (existingType) {
      throw new apiError(400, "Type name already exists");
    }
    type.name = name.trim();
  }

  if (sizes) {
    type.sizes = sizes;
  }

  await type.save();

  return res
    .status(200)
    .json(new apiResponse(200, "Type updated successfully", type));
});

export const deleteType = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const type = await Type.findByIdAndDelete(id);
  if (!type) {
    throw new apiError(404, "Type not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Type deleted successfully", type));
});
