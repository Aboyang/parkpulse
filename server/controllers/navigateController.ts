import type { Request, Response } from "express";
import { NavigateService } from "../services/navigateService.js";
import { validateRouteBody } from "../validators/navigateValidator.js";

const navigateService = new NavigateService();

export async function getRoute(req: Request, res: Response): Promise<void> {
    const result = validateRouteBody(req.body as Record<string, unknown>);
    if (!result.ok) {
        res.status(400).json({ error: result.error });
        return;
    }

    try {
        const { start, end } = result.data;
        const route = await navigateService.getRoute(start, end);
        res.json(route);
    } catch (err) {
        console.error("NavigateService.getRoute error:", err);
        res.status(500).json({ error: "Failed to fetch route" });
    }
}
