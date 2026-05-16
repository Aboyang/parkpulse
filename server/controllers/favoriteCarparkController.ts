import type { Request, Response } from "express";
import FavoriteCarparkService from "../services/favoriteCarparkService.js";
import { validateFavoriteBody, validateUserIdParam, validateFavoriteParams } from "../validators/favoriteCarparkValidator.js";

const favoriteCarparkService = new FavoriteCarparkService();

export async function addFavorite(req: Request, res: Response): Promise<void> {
    const result = validateFavoriteBody(req.body as Record<string, unknown>);
    if (!result.ok) {
        res.status(400).json({ error: result.error });
        return;
    }

    try {
        const { userId, carparkId } = result.data;
        const response = await favoriteCarparkService.addFavorite(userId, carparkId);
        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add favorite" });
    }
}

export async function getFavorites(req: Request, res: Response): Promise<void> {
    const result = validateUserIdParam(req.params['userId']);
    if (!result.ok) {
        res.status(400).json({ error: result.error });
        return;
    }

    try {
        const response = await favoriteCarparkService.getFavorites(result.data);
        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get favorites" });
    }
}

export async function removeFavorite(req: Request, res: Response): Promise<void> {
    const result = validateFavoriteBody(req.body as Record<string, unknown>);
    if (!result.ok) {
        res.status(400).json({ error: result.error });
        return;
    }

    try {
        const { userId, carparkId } = result.data;
        await favoriteCarparkService.removeFavorite(userId, carparkId);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to remove favorite" });
    }
}

export async function isFavorite(req: Request, res: Response): Promise<void> {
    const result = validateFavoriteParams(req.params['userId'], req.params['carparkId']);
    if (!result.ok) {
        res.status(400).json({ error: result.error });
        return;
    }

    try {
        const { userId, carparkId } = result.data;
        const isFav = await favoriteCarparkService.isFavorite(userId, carparkId);
        res.json({ isFavorite: isFav });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to check favorite" });
    }
}
