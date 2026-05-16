import { CarparkRating } from "../models/carparkRating.js";
import { dynamoAdapter } from "../db/index.js";
import type { DbAdapter } from "../types/db.js";

class RateCarparkService {
  private db: DbAdapter;
  private tableName: string;

  constructor(adapter: DbAdapter = dynamoAdapter) {
    this.db = adapter;
    this.tableName = "rating";
  }

  async rateCarpark(
    carparkId: string,
    userId: string,
    rating: number,
    comment?: string
  ): Promise<ReturnType<CarparkRating["toJSON"]>> {
    const existingRating = await this.db.get(this.tableName, { carparkId });

    const carparkRating = existingRating
      ? CarparkRating.fromDB(existingRating)
      : CarparkRating.empty(carparkId);

    carparkRating.addRating(userId, rating, comment);

    await this.db.put(this.tableName, carparkRating.toDB());

    return carparkRating.toJSON();
  }

  async getCarparkRating(carparkId: string): Promise<ReturnType<CarparkRating["toJSON"]>> {
    const ratingRecord = await this.db.get(this.tableName, { carparkId });

    if (!ratingRecord) return CarparkRating.empty(carparkId).toJSON();

    return CarparkRating.fromDB(ratingRecord).toJSON();
  }
}

export default RateCarparkService;
