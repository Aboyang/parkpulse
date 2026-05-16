import express from "express";
import { getCurrentLocation } from "../controllers/locationController.js";

const router = express.Router();

router.get("/", getCurrentLocation);

export default router;
