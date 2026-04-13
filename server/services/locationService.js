import { Location } from "../models/location.js";

class LocationService {
  async getCurrentLocation() {
    try {
      const res = await fetch("http://ip-api.com/json/");
      const data = await res.json();
      return Location.fromIPApi(data).toJSON();
    } catch (err) {
      console.error("Failed to get location:", err);
      return null;
    }
  }
}

export default LocationService;