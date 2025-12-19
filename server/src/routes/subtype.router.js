import express from "express";
import {
  getSubtypesByType,
  createSubtype,
  updateSubtype,
  deleteSubtype,
} from "../controllers/subtype.controller.js";

const router = express.Router();

router.route("/type/:typeId").get(getSubtypesByType);
router.route("/").post(createSubtype);
router.route("/:id").put(updateSubtype).delete(deleteSubtype);

export default router;
