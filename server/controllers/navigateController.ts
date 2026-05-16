import type { Request, Response } from "express";
import { NavigateService } from "../services/navigateService.js";

const navigateService = new NavigateService();

export async function getRoute(req: Request, res: Response): Promise<void> {
    const { start, end } = req.body;

    if (
        !Array.isArray(start) || start.length !== 2 ||
        !Array.isArray(end) || end.length !== 2
    ) {
        res.status(400).json({ error: "start and end must be [lat, lng] arrays" });
        return;
    }

    try {
        const result = await navigateService.getRoute(start as [number, number], end as [number, number]);
        res.json(result);
    } catch (err) {
        console.error("NavigateService.getRoute error:", err);
        res.status(500).json({ error: "Failed to fetch route" });
    }
}
