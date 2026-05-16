import type { Request, Response } from "express";
import RateCarparkService from "../services/rateCarparkService.js";
import { validateRateCarparkBody, validateGetCarparkRatingParam } from "../validators/rateCarparkValidator.js";

const rateService = new RateCarparkService();

export async function rateCarpark(req: Request, res: Response): Promise<void> {
    const result = validateRateCarparkBody(req.body as Record<string, unknown>);
    if (!result.ok) {
        res.status(400).json({ error: result.error });
        return;
    }

    try {
        const { carparkId, userId, rating, comment } = result.data;
        const data = await rateService.rateCarpark(carparkId, userId, rating, comment);
        res.status(200).json({ message: "Rating added successfully", data });
    } catch (err) {
        console.error("Error rating carpark:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function getCarparkRating(req: Request, res: Response): Promise<void> {
    const result = validateGetCarparkRatingParam(req.params['carparkId']);
    if (!result.ok) {
        res.status(400).json({ error: result.error });
        return;
    }

    try {
        const data = await rateService.getCarparkRating(result.data);
        res.status(200).json({ data });
    } catch (err) {
        console.error("Error fetching rating:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}
