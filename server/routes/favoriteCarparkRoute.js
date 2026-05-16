import express from "express";
import { addFavorite, getFavorites, removeFavorite, isFavorite } from "../controllers/favoriteCarparkController.js";

const router = express.Router();

router.post("/", addFavorite);
router.get("/:userId", getFavorites);
router.delete("/", removeFavorite);
router.get("/:userId/:carparkId", isFavorite);

export default router;