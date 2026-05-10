import { CarparkRating } from "../models/carparkRating.js";
import { dynamoAdapter } from "../db/index.js";

class RateCarparkService {
  constructor(adapter = dynamoAdapter) {
    this.db = adapter;
    this.tableName = "rating";
  }

  async rateCarpark(carparkId, userId, rating, comment) {
    const current = await this.db.get(this.tableName, { carparkId });

    const carparkRating = current
      ? CarparkRating.fromDB(current)
      : CarparkRating.empty(carparkId);

    carparkRating.addRating(userId, rating, comment);

    await this.db.put(this.tableName, carparkRating.toDB());

    return carparkRating.toJSON();
  }

  async getCarparkRating(carparkId) {
    const item = await this.db.get(this.tableName, { carparkId });

    if (!item) return CarparkRating.empty(carparkId).toJSON();

    return CarparkRating.fromDB(item).toJSON();
  }
}

export default RateCarparkService;