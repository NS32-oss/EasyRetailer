import express from "express";
import {
  getAllTypes,
  getTypeById,
  createType,
  updateType,
  deleteType,
} from "../controllers/type.controller.js";

const router = express.Router();

router.route("/").get(getAllTypes).post(createType);
router.route("/:id").get(getTypeById).put(updateType).delete(deleteType);

export default router;
