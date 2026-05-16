import type { Request, Response } from "express";
import RateCarparkService from "../services/rateCarparkService.js";

const rateService = new RateCarparkService();

export async function rateCarpark(req: Request, res: Response): Promise<void> {
    try {
        const { carparkId, userId, rating, comment } = req.body;

        if (!carparkId || !userId || !rating) {
            res.status(400).json({ error: "carparkId, userId, and rating are required" });
            return;
        }

        const result = await rateService.rateCarpark(carparkId, userId, rating, comment);
        res.status(200).json({ message: "Rating added successfully", data: result });
    } catch (err) {
        console.error("Error rating carpark:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function getCarparkRating(req: Request, res: Response): Promise<void> {
    try {
        const carparkId = req.params['carparkId'] as string;
        const result = await rateService.getCarparkRating(carparkId);
        res.status(200).json({ data: result });
    } catch (err) {
        console.error("Error fetching rating:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}
