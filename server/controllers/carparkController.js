import CarparkAvailabilityService from "../services/carparkService.js";
import { getCache, setCache } from "../config/redis.js";

const service = new CarparkAvailabilityService();

export async function getCarparks(req, res) {
    try {
        const { address, radius, ev_charging } = req.query;

        console.log(">>> Fetching nearby carparks with params:", { address, radius, ev_charging });

        if (!address) {
            return res.status(400).json({ error: "Address is required" });
        }

        const parsedRadius = radius ? parseInt(radius) : 500;
        const cacheKey = `carparks:${address}:${parsedRadius}:${ev_charging || "any"}`;

        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            console.log(">>> Cache hit");
            return res.json({ carparks: cachedData, source: "cache" });
        }

        console.log(">>> Cache miss");
        const carparks = await service.findCarparks(address, parsedRadius, ev_charging);
        await setCache(cacheKey, carparks);

        res.json({ carparks, source: "api" });
    } catch (error) {
        console.error("Carpark error:", error.message);
        res.status(500).json({ error: error.message });
    }
}

export async function getCarparkById(req, res) {
    try {
        const { id } = req.params;
        const availability = await service.fetchCarparkAvailabilityById(id);

        if (!availability) {
            return res.status(404).json({ error: "Carpark not found" });
        }

        res.json({ availability });
    } catch (error) {
        console.error("Carpark detail error:", error.message);
        res.status(500).json({ error: error.message });
    }
}
