import express from "express";
import { rateCarpark, getCarparkRating } from "../controllers/rateCarparkController.js";

const router = express.Router();

router.post("/", rateCarpark);
router.get("/:carparkId", getCarparkRating);

export default router;