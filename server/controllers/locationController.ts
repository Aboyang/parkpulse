import type { Request, Response } from "express";
import LocationService from "../services/locationService.js";

const locationService = new LocationService();

export async function getCurrentLocation(req: Request, res: Response): Promise<void> {
    try {
        const coord = await locationService.getCurrentLocation();
        if (!coord) {
            res.status(500).json({ error: "Failed to fetch location" });
            return;
        }
        res.json(coord);
    } catch (err) {
        console.error("Error in location controller:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}
