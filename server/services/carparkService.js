// NOTES:
// Previously using Google Maps API for geocoding nearby search but switched to OneMap API + DATA.GOV.SG database for better compatibility with SG carpark data 

import axios from "axios";
import { svy21ToLatLon } from "../utils/coordConverter.js";
import { carparkDB } from "../utils/carparkDB.js";
import RateCarparkService from "./rateCarparkService.js";
const rateService = new RateCarparkService();

import path from "path";
import dotenv from "dotenv";

// Load environment variables from the project root
dotenv.config({ path: path.resolve("../.env") });

class CarparkAvailabilityService {
  constructor() {
    this.ONEMAP_API_KEY = process.env.ONEMAP_API_KEY;
    this.DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY;
  }

  // Convert address → lat/lng using OneMap Elastic Search API
  async getGeocode(address) {
    const encoded = encodeURIComponent(address);
    const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encoded}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
    
    const authToken = this.ONEMAP_API_KEY;
    const { data } = await axios.get(url, {
      headers: {
        Authorization: authToken,
      },
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

  // Search nearby carparks
  async searchNearbyCarpark(latitude, longitude, radius, evCharging) {
    // Step 1: Filter nearby carparks
    const nearbyCarparksRaw = carparkDB
      .map((carpark) => {
        const cx = parseFloat(carpark.x_coord);
        const cy = parseFloat(carpark.y_coord);
        const dist2 = (cx - latitude) ** 2 + (cy - longitude) ** 2;
        return { carpark, dist2 };
      })
      .filter((c) => c.dist2 <= radius ** 2)
      .map((c) => ({ ...c, dist: Math.sqrt(c.dist2) }))
      .sort((a, b) => a.dist - b.dist);

    console.log(`>>> Found ${nearbyCarparksRaw.length} carparks within ${radius}m`);

    // Step 2: Fetch availability
    const availabilityData = await this.fetchCarparkAvailability();

    // Step 3: Enrich carparks (here’s the correct place for await)
    const enrichedCarparks = await Promise.all(
      nearbyCarparksRaw.map(async ({ carpark, dist }) => {
        const availability = availabilityData.find(
          (a) => a.carpark_number === carpark.car_park_no
        );
        const info = availability?.carpark_info?.[0];

        let operating_hours = "Unknown";
        if (carpark.short_term_parking === "NO") {
          operating_hours = "Season parking only";
        } else if (
          carpark.short_term_parking === "WHOLE DAY" &&
          carpark.night_parking === "YES"
        ) {
          operating_hours = "24 hrs";
        } else {
          operating_hours = carpark.short_term_parking;
        }

        const { latitude: lat, longitude: lon } = svy21ToLatLon(
          parseFloat(carpark.x_coord),
          parseFloat(carpark.y_coord)
        );

        const rating = await rateService.getCarparkRating(carpark.car_park_no);

        return {
          carpark_no: carpark.car_park_no,
          name: carpark.address,
          location: { latitude: lat, longitude: lon },
          available_lots: info ? parseInt(info.lots_available) : null,
          total_capacity: info ? parseInt(info.total_lots) : null,
          operating_hours,
          free_parking: carpark.free_parking !== "NO",
          free_parking_details: carpark.free_parking,
          payment: carpark.type_of_parking_system,
          ev_charging: carpark.ev_charging === "YES",
          distance: dist,
          average_rating: rating?.averageRating ?? null,
          total_ratings: rating?.totalRatings ?? null
        };
      })
    );

    // Step 4: EV filter
    return enrichedCarparks.filter((c) => (evCharging ? c.ev_charging : true));
  }

  // Fetch real-time availability for all carparks
  async fetchCarparkAvailability() {
    // LTA DataMall API (commented out)
    /*
    try {
      const response = await axios.get(
        "https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2",
        {
          headers: {
            AccountKey: "fqKEEst4QbqBo2WqRoFYiQ==",
            Accept: "application/json",
          },
        }
      );
      return response.data.value || [];
    } catch (error) {
      console.error("Error fetching CarParkAvailability:", error.response?.data || error.message);
      throw error;
    }
    */

    // GOV Data API
    const url = "https://api.data.gov.sg/v1/transport/carpark-availability";

    try {
      const { data } = await axios.get(url, {
        headers: {
          "X-Api-Key": this.DATA_GOV_API_KEY,
        },
      });

      return data.items[0]?.carpark_data || [];
    } catch (error) {
      console.error(
        "Error fetching Data.gov.sg carpark availability:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  // Sort carparks by availability (most available first)
  sortByAvailability(carparks) {
    return carparks.sort((a, b) => {
      if (a.available_lots === "No data") return -1;
      if (b.available_lots === "No data") return 1;
      return b.available_lots - a.available_lots;
    });
  }

  // Fetch availability for a specific carpark by ID
  async fetchCarparkAvailabilityById(carparkId) {
    const availabilityData = await this.fetchCarparkAvailability();
    const availability = availabilityData.find((a) => a.carpark_number === carparkId);
    console.log(`>>> Availability for ${carparkId}`);
    const info = availability?.carpark_info?.[0];

    return info
  }

  // MAIN FUNCTION: find carparks near an address with availability and other info
  async findCarparks(address, radius = 500, evCharging = false) {
    // Step 1: Geocode address → lat/lng
    const geo = await this.getGeocode(address);

    // Step 2: Search nearby carparks
    let carparks = await this.searchNearbyCarpark(geo.latitude, geo.longitude, radius, evCharging);

    // Step 3: Sort by availability
    carparks = this.sortByAvailability(carparks);

    return carparks;
  }
}

export default CarparkAvailabilityService;

// Testing
// const c = new CarparkAvailabilityService();
// const carparks = await c.findCarparks("Ang Mo Kio Central Market & Food Centre", 500)
// console.log(carparks);


(async () => {
  const c = new CarparkAvailabilityService();
  try {
    const res = await c.getGeocode("NANYANG TECHNOLOGICAL UNIVERSITY (BLK 1) (HALL OF RESIDENCE 2)");
    console.log(res);
  } catch (err) {
    console.error(err);
  }
})();

  // easting: 10937.31900278171,
  // northing: 36583.738124428164,
  // port: 3000