import { svy21ToLatLon } from "../utils/coordConverter.js";

export class Carpark {
  constructor(raw) {
    this.carparkNo = raw.car_park_no;
    this.name = raw.address;
    this.xCoord = parseFloat(raw.x_coord);
    this.yCoord = parseFloat(raw.y_coord);
    this.freeParking = raw.free_parking !== "NO";
    this.freeParkingDetails = raw.free_parking;
    this.payment = raw.type_of_parking_system;
    this.evCharging = raw.ev_charging === "YES";
    this.shortTermParking = raw.short_term_parking;
    this.nightParking = raw.night_parking;
  }

  getLatLon() {
    const { latitude, longitude } = svy21ToLatLon(this.xCoord, this.yCoord);
    return { latitude, longitude };
  }

  getOperatingHours() {
    if (this.shortTermParking === "NO") return "Season parking only";
    if (this.shortTermParking === "WHOLE DAY" && this.nightParking === "YES") return "24 hrs";
    return this.shortTermParking;
  }

  distanceTo(latitude, longitude) {
    const dx = this.xCoord - latitude;
    const dy = this.yCoord - longitude;
    return Math.sqrt(dx ** 2 + dy ** 2);
  }

  isWithinRadius(latitude, longitude, radius) {
    const dx = this.xCoord - latitude;
    const dy = this.yCoord - longitude;
    return dx ** 2 + dy ** 2 <= radius ** 2;
  }
}