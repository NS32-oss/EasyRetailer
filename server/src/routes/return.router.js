import { Router } from "express";
import { createReturn, listReturns } from "../controllers/return.controller.js";

const router = Router();

router.route("/").get(listReturns).post(createReturn);

export default router;
