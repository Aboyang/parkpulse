import { carparkDB } from "../data/carparkDB.js";
import { Carpark } from "../models/carpark.js";
import { CarparkAvailability } from "../models/carparkAvailability.js";
import type { CarparkAvailabilityApiEntry, EnrichedCarpark } from "../types/carpark.js";
import type { CarparkRating } from "../models/carparkRating.js";

interface NearbyCarpark {
  carpark: Carpark;
  dist: number;
}

export function filterAndSortByDistance(latitude: number, longitude: number, radius: number): NearbyCarpark[] {
  return carparkDB
    .map((raw) => new Carpark(raw))
    .filter((c) => c.isWithinRadius(latitude, longitude, radius))
    .map((c) => ({ carpark: c, dist: c.distanceTo(latitude, longitude) }))
    .sort((a, b) => a.dist - b.dist);
}

export function buildEnrichedEntry(
  carpark: Carpark,
  dist: number,
  availabilityData: CarparkAvailabilityApiEntry[],
  rating: ReturnType<CarparkRating["toJSON"]> | null | undefined
): EnrichedCarpark {
  const apiEntry = availabilityData.find((a) => a.carpark_number === carpark.carparkNo);
  const availability = apiEntry
    ? CarparkAvailability.fromApiData(apiEntry)
    : new CarparkAvailability(carpark.carparkNo, null);
  const { latitude: lat, longitude: lon } = carpark.getLatLon();
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
}

export function sortByAvailability(carparks: EnrichedCarpark[]): EnrichedCarpark[] {
  return carparks.sort((a, b) => {
    if (a.available_lots === null) return -1;
    if (b.available_lots === null) return 1;
    return b.available_lots - a.available_lots;
  });
}

export function filterByEV(carparks: EnrichedCarpark[], evCharging: boolean): EnrichedCarpark[] {
  return carparks.filter((c) => (evCharging ? c.ev_charging : true));
}
