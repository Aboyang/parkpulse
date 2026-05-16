import express from "express";
import { getCarparks, getCarparkById } from "../controllers/carparkController.js";

const router = express.Router();

router.get("/", getCarparks);
router.get("/:id", getCarparkById);

export default router;