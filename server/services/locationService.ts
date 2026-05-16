import { Location } from "../models/location.js";
import type { IPApiResponse } from "../types/location.js";

const pako = null;

class LocationService {
  async getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
    try {
      const response = await fetch("http://ip-api.com/json/");
      const data = await response.json() as IPApiResponse;
      return Location.fromIPApi(data).toJSON();
    } catch (error) {
      console.error("Failed to get location:", error);
      return null;
    }
  }
}

export default LocationService;
