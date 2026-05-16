import type { Request, Response } from "express";
import CarparkAvailabilityService, { DEFAULT_SEARCH_RADIUS_METRES } from "../services/carparkService.js";
import { getCache, setCache } from "../config/redis.js";
import type { EnrichedCarpark } from "../types/carpark.js";

const service = new CarparkAvailabilityService();

export async function getCarparks(req: Request, res: Response): Promise<void> {
    try {
        const { address, radius, ev_charging } = req.query;

        console.log(">>> Fetching nearby carparks with params:", { address, radius, ev_charging });

        if (!address) {
            res.status(400).json({ error: "Address is required" });
            return;
        }

        const parsedRadius = radius ? parseInt(radius as string) : DEFAULT_SEARCH_RADIUS_METRES;
        const cacheKey = `carparks:${address}:${parsedRadius}:${ev_charging || "any"}`;

        const cachedData = await getCache(cacheKey) as EnrichedCarpark[] | null;
        if (cachedData) {
            console.log(">>> Cache hit");
            res.json({ carparks: cachedData, source: "cache" });
            return;
        }

        console.log(">>> Cache miss");
        const carparks = await service.findCarparks(address as string, parsedRadius, ev_charging === "true");
        await setCache(cacheKey, carparks);

        res.json({ carparks, source: "api" });
    } catch (error) {
        console.error("Carpark error:", (error as Error).message);
        res.status(500).json({ error: (error as Error).message });
    }
}

export async function getCarparkById(req: Request, res: Response): Promise<void> {
    try {
        const id = req.params['id'] as string;
        const availability = await service.fetchCarparkAvailabilityById(id);

        if (!availability) {
            res.status(404).json({ error: "Carpark not found" });
            return;
        }

        res.json({ availability });
    } catch (error) {
        console.error("Carpark detail error:", (error as Error).message);
        res.status(500).json({ error: (error as Error).message });
    }
}
