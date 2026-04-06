import express from "express";
import RateCarparkService from "../services/rateCarparkService.js";

const router = express.Router();
const rateService = new RateCarparkService();

// POST /rating
// Body: { carparkId, userId, rating, comment }
router.post("/", async (req, res) => {
  try {
    const { carparkId, userId, rating, comment } = req.body;

    if (!carparkId || !userId || !rating ) {
      return res.status(400).json({ error: "carparkId, userId, and rating are required" });
    }

    const result = await rateService.rateCarpark(carparkId, userId, rating, comment);
    return res.status(200).json({ message: "Rating added successfully", data: result });
  } catch (err) {
    console.error("Error rating carpark:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /rating/:carparkId
router.get("/:carparkId", async (req, res) => {
  try {
    const { carparkId } = req.params;
    const result = await rateService.getCarparkRating(carparkId);
    return res.status(200).json({ data: result });
  } catch (err) {
    console.error("Error fetching rating:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;