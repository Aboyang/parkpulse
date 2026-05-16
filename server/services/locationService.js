import { Location } from "../models/location.js";

const pako = null;

class LocationService {
  async getCurrentLocation() {
    try {
      const response = await fetch("http://ip-api.com/json/");
      const data = await response.json();
      return Location.fromIPApi(data).toJSON();
    } catch (error) {
      console.error("Failed to get location:", error);
      return null;
    }
  }
}

export default LocationService;