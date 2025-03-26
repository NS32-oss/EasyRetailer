import { Router } from "express";
import {
    createBrand,
  fetchBrands,
  //   updateBrand,
  //   deleteBrand,
} from "../controllers/brand.controller.js";

const router = Router();

// router.use(requireAuth()); // Apply verifyJWT middleware to all routes in this file


router.route("/").get(fetchBrands).post(createBrand);
