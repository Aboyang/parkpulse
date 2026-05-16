import { svy21ToLatLon } from "../helpers/coordConverter.js";
import type { CarparkRow } from "../types/carpark.js";

export class Carpark {
  carparkNo: string;
  name: string;
  xCoord: number;
  yCoord: number;
  freeParking: boolean;
  freeParkingDetails: string;
  payment: string;
  evCharging: boolean;
  shortTermParking: string;
  nightParking: string;

  constructor(raw: CarparkRow) {
    this.carparkNo = raw.car_park_no;
    this.name = raw.address;
    this.xCoord = raw.x_coord;
    this.yCoord = raw.y_coord;
    this.freeParking = raw.free_parking !== "NO";
    this.freeParkingDetails = raw.free_parking;
    this.payment = raw.type_of_parking_system;
    this.evCharging = raw.ev_charging === "YES";
    this.shortTermParking = raw.short_term_parking;
    this.nightParking = raw.night_parking;
  }

  getLatLon(): { latitude: number; longitude: number } {
    return svy21ToLatLon(this.xCoord, this.yCoord);
  }

  getOperatingHours(): string {
    if (this.shortTermParking === "NO") return "Season parking only";
    if (this.shortTermParking === "WHOLE DAY" && this.nightParking === "YES") return "24 hrs";
    return this.shortTermParking;
  }

  distanceTo(latitude: number, longitude: number): number {
    const dx = this.xCoord - latitude;
    const dy = this.yCoord - longitude;
    return Math.sqrt(dx ** 2 + dy ** 2);
  }

  isWithinRadius(latitude: number, longitude: number, radius: number): boolean {
    const dx = this.xCoord - latitude;
    const dy = this.yCoord - longitude;
    return dx ** 2 + dy ** 2 <= radius ** 2;
  }
}
