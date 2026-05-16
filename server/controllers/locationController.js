import LocationService from "../services/locationService.js";

const locationService = new LocationService();

export async function getCurrentLocation(req, res) {
    try {
        const coord = await locationService.getCurrentLocation();
        if (!coord) {
            return res.status(500).json({ error: "Failed to fetch location" });
        }
        res.json(coord);
    } catch (err) {
        console.error("Error in location controller:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}
