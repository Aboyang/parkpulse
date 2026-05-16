import axios from "axios";
import RateCarparkService from "./rateCarparkService.js";
import {
  filterAndSortByDistance,
  buildEnrichedEntry,
  sortByAvailability,
  filterByEV,
} from "../helpers/carparkHelper.js";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve("../.env") });

export const DEFAULT_SEARCH_RADIUS_METRES = 500;

const rateService = new RateCarparkService();

class CarparkAvailabilityService {
  constructor() {
    this.ONEMAP_API_KEY = process.env.ONEMAP_API_KEY;
    this.DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY;
  }

  async getGeocode(address) {
    const encoded = encodeURIComponent(address);
    const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encoded}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;

    const { data } = await axios.get(url, {
      headers: { Authorization: this.ONEMAP_API_KEY },
    });

    if (!data.results || data.results.length === 0) {
      throw new Error("Address not found");
    }

    const result = data.results[0];
    return {
      formattedAddress: result.ADDRESS,
      latitude: parseFloat(result.X),
      longitude: parseFloat(result.Y),
    };
  }

  async fetchAllCarparkAvailability() {
    const url = "https://api.data.gov.sg/v1/transport/carpark-availability";
    try {
      const { data } = await axios.get(url, {
        headers: { "X-Api-Key": this.DATA_GOV_API_KEY },
      });
      return data.items[0]?.carpark_data || [];
    } catch (error) {
      console.error("Error fetching carpark availability:", error.response?.data || error.message);
      throw error;
    }
  }

  async fetchCarparkAvailabilityById(carparkId) {
    const availabilityData = await this.fetchAllCarparkAvailability();
    const entry = availabilityData.find((a) => a.carpark_number === carparkId);
    console.log(`>>> Availability for ${carparkId}`);
    const info = entry?.carpark_info?.[0];
    return info;
  }

  async fetchEnrichedCarparksAtCoords(latitude, longitude, radius, evCharging) {
    const nearbyCarparks = filterAndSortByDistance(latitude, longitude, radius);
    console.log(`>>> Found ${nearbyCarparks.length} carparks within ${radius}m`);

    const availabilityData = await this.fetchAllCarparkAvailability();
    console.log(`>>> Fetching availability for carparks: ${nearbyCarparks.map((c) => c.carpark.carparkNo).join(", ")}`);

    const enrichedCarparks = await Promise.all(
      nearbyCarparks.map(async ({ carpark, distance }) => {
        const rating = await rateService.getCarparkRating(carpark.carparkNo);
        return buildEnrichedEntry(carpark, distance, availabilityData, rating);
      })
    );

    return filterByEV(enrichedCarparks, evCharging);
  }

  async findCarparks(address, radius = DEFAULT_SEARCH_RADIUS_METRES, evCharging = false) {
    const geocodeResult = await this.getGeocode(address);
    let carparks = await this.fetchEnrichedCarparksAtCoords(geocodeResult.latitude, geocodeResult.longitude, radius, evCharging);
    carparks = sortByAvailability(carparks);
    console.log(">>> Final carparks:", carparks.map(c => `${c.carpark_no} (${c.available_lots} lots)`));
    return carparks;
  }
}

export default CarparkAvailabilityService;
