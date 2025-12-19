import asyncHandler from "../utils/asyncHandler.js";
import { Subtype } from "../models/subtype.model.js";
import { Type } from "../models/type.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import mongoose from "mongoose";

export const getSubtypesByType = asyncHandler(async (req, res) => {
  const { typeId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(typeId)) {
    throw new apiError(400, "Invalid type ID");
  }

  const subtypes = await Subtype.find({ type: typeId })
    .populate("type")
    .sort({ name: 1 });

  return res
    .status(200)
    .json(
      new apiResponse(200, "Subtypes fetched successfully", subtypes)
    );
});

export const createSubtype = asyncHandler(async (req, res) => {
  const { name, typeId } = req.body;

  if (!name || !name.trim()) {
    throw new apiError(400, "Subtype name is required");
  }

  if (!typeId || !mongoose.Types.ObjectId.isValid(typeId)) {
    throw new apiError(400, "Valid type ID is required");
  }

  const type = await Type.findById(typeId);
  if (!type) {
    throw new apiError(404, "Type not found");
  }

  const existingSubtype = await Subtype.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
    type: typeId,
  });

  if (existingSubtype) {
    throw new apiError(400, "Subtype already exists for this type");
  }

  const newSubtype = await Subtype.create({
    name: name.trim(),
    type: typeId,
  });

  await newSubtype.populate("type");

  return res
    .status(201)
    .json(new apiResponse(201, "Subtype created successfully", newSubtype));
});

export const updateSubtype = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const subtype = await Subtype.findById(id);
  if (!subtype) {
    throw new apiError(404, "Subtype not found");
  }

  if (name) {
    const existingSubtype = await Subtype.findOne({
      _id: { $ne: id },
      name: { $regex: `^${name}$`, $options: "i" },
      type: subtype.type,
    });
    if (existingSubtype) {
      throw new apiError(400, "Subtype name already exists for this type");
    }
    subtype.name = name.trim();
  }

  await subtype.save();
  await subtype.populate("type");

  return res
    .status(200)
    .json(new apiResponse(200, "Subtype updated successfully", subtype));
});

export const deleteSubtype = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const subtype = await Subtype.findByIdAndDelete(id);
  if (!subtype) {
    throw new apiError(404, "Subtype not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Subtype deleted successfully", subtype));
});
