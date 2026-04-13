import axios from "axios";
import { carparkDB } from "../utils/carparkDB.js";
import RateCarparkService from "./rateCarparkService.js";
import { Carpark } from "../models/carpark.js";
import { CarparkAvailability } from "../models/carparkAvailability.js";
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
    // Step 1: Build Carpark entities, filter + sort by distance
    const nearby = carparkDB
      .map((raw) => new Carpark(raw))
      .filter((c) => c.isWithinRadius(latitude, longitude, radius))
      .map((c) => ({ carpark: c, dist: c.distanceTo(latitude, longitude) }))
      .sort((a, b) => a.dist - b.dist);

    console.log(`>>> Found ${nearby.length} carparks within ${radius}m`);

    // Step 2: Fetch availability
    const availabilityData = await this.fetchCarparkAvailability();

    // Step 3: Enrich each carpark with availability + ratings
    const enriched = await Promise.all(
      nearby.map(async ({ carpark, dist }) => {
        const apiEntry = availabilityData.find(
          (a) => a.carpark_number === carpark.carparkNo
        );

        // Build CarparkAvailability entity
        const availability = apiEntry
          ? CarparkAvailability.fromApiData(apiEntry)
          : new CarparkAvailability(carpark.carparkNo, null);

        const { latitude: lat, longitude: lon } = carpark.getLatLon();
        const rating = await rateService.getCarparkRating(carpark.carparkNo);

        return {
          carpark_no: carpark.carparkNo,
          name: carpark.name,
          location: { latitude: lat, longitude: lon },
          available_lots: availability.availableLots,
          total_capacity: availability.totalLots,
          operating_hours: carpark.getOperatingHours(),
          free_parking: carpark.freeParking,
          free_parking_details: carpark.freeParkingDetails,
          payment: carpark.payment,
          ev_charging: carpark.evCharging,
          distance: dist,
          average_rating: rating?.averageRating ?? null,
          total_ratings: rating?.totalRatings ?? null,
        };
      })
    );

    // Step 4: EV filter
    return enriched.filter((c) => (evCharging ? c.ev_charging : true));
  }

  sortByAvailability(carparks) {
    return carparks.sort((a, b) => {
      if (a.available_lots === null) return -1;
      if (b.available_lots === null) return 1;
      return b.available_lots - a.available_lots;
    });
  }

  async findCarparks(address, radius = 500, evCharging = false) {
    const geo = await this.getGeocode(address);
    let carparks = await this.searchNearbyCarpark(geo.latitude, geo.longitude, radius, evCharging);
    carparks = this.sortByAvailability(carparks);
    return carparks;
  }
}

export default CarparkAvailabilityService;