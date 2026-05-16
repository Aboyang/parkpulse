import type { Carpark } from "./carpark.js";

interface FavoriteCarparkRecord {
  userId: string;
  carparkId: string;
  createdAt?: string;
}

export class FavoriteCarpark {
  userId: string;
  carparkId: string;
  createdAt: string;

  constructor({ userId, carparkId, createdAt }: FavoriteCarparkRecord) {
    this.userId = userId;
    this.carparkId = carparkId;
    this.createdAt = createdAt ?? new Date().toISOString();
  }

  toDB(): { userId: string; carparkId: string; createdAt: string } {
    return {
      userId: this.userId,
      carparkId: this.carparkId,
      createdAt: this.createdAt,
    };
  }

  toJSON(carpark: Carpark): {
    userId: string;
    carparkId: string;
    createdAt: string;
    carparkName: string;
    latitude: number;
    longitude: number;
    operating_hours: string;
  } {
    const { latitude, longitude } = carpark.getLatLon();
    return {
      userId: this.userId,
      carparkId: this.carparkId,
      createdAt: this.createdAt,
      carparkName: carpark.name,
      latitude,
      longitude,
      operating_hours: carpark.getOperatingHours(),
    };
  }

  static fromDB(item: Record<string, unknown>): FavoriteCarpark {
    return new FavoriteCarpark(item as unknown as FavoriteCarparkRecord);
  }
}
