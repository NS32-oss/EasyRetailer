import asyncHandler from "../utils/asyncHandler.js";
import { Business } from "../models/business.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";

// Create a new business (only one business per owner)
export const createBusiness = asyncHandler(async (req, res) => {
  const { businessName, name } = req.body;

  if (!businessName || businessName.trim() === "") {
    throw new apiError(400, "Business name is required");
  }
  if (!name || name.trim() === "") {
    throw new apiError(400, "Business name is required");
  }

  // Extract authenticated user details from req.auth (populated by Clerk or custom middleware)
  const { clerkId, email } = req.auth;

  // Check if a business already exists for this owner
  const existingBusiness = await Business.findOne({ ownerClerkId: clerkId });
  if (existingBusiness) {
    throw new apiError(400, "Business already exists for this owner.");
  }

  // Create and save the new business
  const business = await Business.create({
    businessName,
    name,
    ownerEmail: email,
    ownerClerkId: clerkId,
  });

  return res
    .status(201)
    .json(new apiResponse(201, "Business created successfully", business));
});

// Get the authenticated owner's business details
export const getBusiness = asyncHandler(async (req, res) => {
  const { clerkId } = req.auth;

  const business = await Business.findOne({ ownerClerkId: clerkId });
  if (!business) {
    throw new apiError(404, "Business not found.");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Business fetched successfully", business));
});

// Update business details (only the owner can update)
export const updateBusiness = asyncHandler(async (req, res) => {
  const { clerkId } = req.auth;
  const updateData = req.body;

  const business = await Business.findOneAndUpdate(
    { ownerClerkId: clerkId },
    updateData,
    { new: true }
  );

  if (!business) {
    throw new apiError(404, "Business not found or unauthorized.");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Business updated successfully", business));
});

// (Optional) Add an employee to the business
export const addEmployeeToBusiness = asyncHandler(async (req, res) => {
  const { clerkId } = req.auth; // Business owner's Clerk ID from authentication
  const { employeeEmail } = req.body; // Only require email from the owner

  if (!employeeEmail) {
    throw new apiError(400, "Employee email is required.");
  }

  // Find the business owned by the authenticated user
  const business = await Business.findOne({ ownerClerkId: clerkId });
  if (!business) {
    throw new apiError(404, "Business not found.");
  }

  // Check if the employee is already added
  const exists = business.employees.some((emp) => emp.email === employeeEmail);
  if (exists) {
    throw new apiError(400, "Employee already exists.");
  }

  // Add the employee with email. Later, you can use Clerk API to fetch and update the clerkId.
  business.employees.push({ email: employeeEmail, role: "employee" });
  await business.save();

  return res
    .status(200)
    .json(new apiResponse(200, "Employee added successfully", business));
});
