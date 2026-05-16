import type { Request, Response } from "express";
import CarparkAvailabilityService from "../services/carparkService.js";
import { getCache, setCache } from "../config/redis.js";
import type { EnrichedCarpark } from "../types/carpark.js";
import { validateGetCarparksQuery, validateGetCarparkByIdParam } from "../validators/carparkValidator.js";

const service = new CarparkAvailabilityService();

export async function getCarparks(req: Request, res: Response): Promise<void> {
    try {
        const result = validateGetCarparksQuery(req.query as Record<string, unknown>);
        if (!result.ok) {
            res.status(400).json({ error: result.error });
            return;
        }

        const { address, radius, evCharging } = result.data;

        console.log(">>> Fetching nearby carparks with params:", { address, radius, evCharging });

        const cacheKey = `carparks:${address}:${radius}:${evCharging ? "true" : "any"}`;

        const cachedData = await getCache(cacheKey) as EnrichedCarpark[] | null;
        if (cachedData) {
            console.log(">>> Cache hit");
            res.json({ carparks: cachedData, source: "cache" });
            return;
        }

        console.log(">>> Cache miss");
        const carparks = await service.findCarparks(address, radius, evCharging);
        await setCache(cacheKey, carparks);

        res.json({ carparks, source: "api" });
    } catch (error) {
        console.error("Carpark error:", (error as Error).message);
        res.status(500).json({ error: (error as Error).message });
    }
}

export async function getCarparkById(req: Request, res: Response): Promise<void> {
    try {
        const result = validateGetCarparkByIdParam(req.params['id']);
        if (!result.ok) {
            res.status(400).json({ error: result.error });
            return;
        }

        const availability = await service.fetchCarparkAvailabilityById(result.data);

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
