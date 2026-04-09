import express from "express";
import LocationService from "../services/locationService.js";

const router = express.Router();
const locationService = new LocationService();

router.get("/", async (req, res) => {
  try {
    const coord = await locationService.getCurrentLocation();
    if (!coord) {
      return res.status(500).json({ error: "Failed to fetch location" });
    }
    res.json(coord);
  } catch (err) {
    console.error("Error in location route:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;