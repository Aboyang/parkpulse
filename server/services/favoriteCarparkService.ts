import { FavoriteCarpark } from "../models/favoriteCarpark.js";
import { dynamoAdapter } from "../db/index.js";
import { enrichFavoriteWithCarpark } from "../helpers/favoriteCarparkHelper.js";
import type { DbAdapter } from "../types/db.js";

class FavoriteCarparkService {
  private db: DbAdapter;
  private tableName: string;

  constructor(adapter: DbAdapter = dynamoAdapter) {
    this.db = adapter;
    this.tableName = "favorites";
  }

  async addFavorite(userId: string, carparkId: string): Promise<ReturnType<FavoriteCarpark["toDB"]>> {
    const favorite = new FavoriteCarpark({ userId, carparkId });
    await this.db.put(this.tableName, favorite.toDB());
    return favorite.toDB();
  }

  async getFavorites(userId: string): Promise<ReturnType<FavoriteCarpark["toJSON"]>[]> {
    const items = await this.db.query(this.tableName, { userId });
    return items.map((item) => {
      const favorite = FavoriteCarpark.fromDB(item);
      return enrichFavoriteWithCarpark(favorite);
    });
  }

  async removeFavorite(userId: string, carparkId: string): Promise<true> {
    await this.db.delete(this.tableName, { userId, carparkId });
    return true;
  }

  async isFavorite(userId: string, carparkId: string): Promise<boolean> {
    const item = await this.db.get(this.tableName, { userId, carparkId });
    return item !== null;
  }
}

export default FavoriteCarparkService;
