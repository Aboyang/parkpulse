import { CarparkRating } from "../models/carparkRating.js";
import { dynamoAdapter } from "../db/index.js";

class RateCarparkService {
  constructor(adapter = dynamoAdapter) {
    this.db = adapter;
    this.tableName = "rating";
  }

  async rateCarpark(carparkId, userId, rating, comment) {
    const existingRating = await this.db.get(this.tableName, { carparkId });

    const carparkRating = existingRating
      ? CarparkRating.fromDB(existingRating)
      : CarparkRating.empty(carparkId);

    carparkRating.addRating(userId, rating, comment);

    await this.db.put(this.tableName, carparkRating.toDB());

    return carparkRating.toJSON();
  }

  async getCarparkRating(carparkId) {
    const ratingRecord = await this.db.get(this.tableName, { carparkId });

    if (!ratingRecord) return CarparkRating.empty(carparkId).toJSON();

    return CarparkRating.fromDB(ratingRecord).toJSON();
  }
}

export default RateCarparkService;