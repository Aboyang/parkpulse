import { Router } from "express";
import { getRoute } from "../controllers/navigateController.js";

const router = Router();

router.post("/route", getRoute);

export default router;
