export class FavoriteCarpark {
  constructor({ userId, carparkId, createdAt }) {
    this.userId = userId;
    this.carparkId = carparkId;
    this.createdAt = createdAt ?? new Date().toISOString();
  }

  toDB() {
    return {
      userId: this.userId,
      carparkId: this.carparkId,
      createdAt: this.createdAt,
    };
  }

  // Merge with Carpark entity data for full response
  toJSON(carpark) {
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

  static fromDB(item) {
    return new FavoriteCarpark(item);
  }
}