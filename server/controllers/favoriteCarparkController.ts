import type { Request, Response } from "express";
import FavoriteCarparkService from "../services/favoriteCarparkService.js";

const favoriteCarparkService = new FavoriteCarparkService();

export async function addFavorite(req: Request, res: Response): Promise<void> {
    try {
        const { userId, carparkId } = req.body;

        if (!userId || !carparkId) {
            res.status(400).json({ error: "userId and carparkId are required" });
            return;
        }

        const result = await favoriteCarparkService.addFavorite(userId, carparkId);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add favorite" });
    }
}

export async function getFavorites(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.params['userId'] as string;
        const result = await favoriteCarparkService.getFavorites(userId);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get favorites" });
    }
}

export async function removeFavorite(req: Request, res: Response): Promise<void> {
    try {
        const { userId, carparkId } = req.body;

        if (!userId || !carparkId) {
            res.status(400).json({ error: "userId and carparkId are required" });
            return;
        }

        await favoriteCarparkService.removeFavorite(userId, carparkId);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to remove favorite" });
    }
}

export async function isFavorite(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.params['userId'] as string;
        const carparkId = req.params['carparkId'] as string;
        const result = await favoriteCarparkService.isFavorite(userId, carparkId);
        res.json({ isFavorite: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to check favorite" });
    }
}
