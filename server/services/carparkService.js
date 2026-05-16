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

  async fetchCarparkAvailability() {
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
    const availabilityData = await this.fetchCarparkAvailability();
    const entry = availabilityData.find((a) => a.carpark_number === carparkId);
    console.log(`>>> Availability for ${carparkId}`);
    const info = entry?.carpark_info?.[0];
    return info;
  }

  async searchNearbyCarpark(latitude, longitude, radius, evCharging) {
    const nearby = filterAndSortByDistance(latitude, longitude, radius);
    console.log(`>>> Found ${nearby.length} carparks within ${radius}m`);

    const availabilityData = await this.fetchCarparkAvailability();
    console.log(`>>> Fetching availability for carparks: ${nearby.map((c) => c.carpark.carparkNo).join(", ")}`);

    const enriched = await Promise.all(
      nearby.map(async ({ carpark, dist }) => {
        const rating = await rateService.getCarparkRating(carpark.carparkNo);
        return buildEnrichedEntry(carpark, dist, availabilityData, rating);
      })
    );

    return filterByEV(enriched, evCharging);
  }

  async findCarparks(address, radius = 500, evCharging = false) {
    const geo = await this.getGeocode(address);
    let carparks = await this.searchNearbyCarpark(geo.latitude, geo.longitude, radius, evCharging);
    carparks = sortByAvailability(carparks);
    console.log(">>> Final carparks:", carparks.map(c => `${c.carpark_no} (${c.available_lots} lots)`));
    return carparks;
  }
}

export default CarparkAvailabilityService;
