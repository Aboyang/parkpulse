import type { IPApiResponse } from "../types/location.js";

export class Location {
  lat: number;
  lng: number;

  constructor({ lat, lng }: { lat: number; lng: number }) {
    this.lat = lat;
    this.lng = lng;
  }

  toJSON(): { lat: number; lng: number } {
    return { lat: this.lat, lng: this.lng };
  }

  static fromIPApi(data: IPApiResponse): Location {
    return new Location({ lat: data.lat, lng: data.lon });
  }
}
