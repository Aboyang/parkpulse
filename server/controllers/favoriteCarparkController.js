import FavoriteCarparkService from "../services/favoriteCarparkService.js";

const favoriteCarparkService = new FavoriteCarparkService();

export async function addFavorite(req, res) {
    try {
        const { userId, carparkId } = req.body;

        if (!userId || !carparkId) {
            return res.status(400).json({ error: "userId and carparkId are required" });
        }

        const result = await favoriteCarparkService.addFavorite(userId, carparkId);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add favorite" });
    }
}

export async function getFavorites(req, res) {
    try {
        const { userId } = req.params;
        const result = await favoriteCarparkService.getFavorites(userId);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get favorites" });
    }
}

export async function removeFavorite(req, res) {
    try {
        const { userId, carparkId } = req.body;

        if (!userId || !carparkId) {
            return res.status(400).json({ error: "userId and carparkId are required" });
        }

        await favoriteCarparkService.removeFavorite(userId, carparkId);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to remove favorite" });
    }
}

export async function isFavorite(req, res) {
    try {
        const { userId, carparkId } = req.params;
        const result = await favoriteCarparkService.isFavorite(userId, carparkId);
        res.json({ isFavorite: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to check favorite" });
    }
}
