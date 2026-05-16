import { FavoriteCarpark } from "../models/favoriteCarpark.js";
import { dynamoAdapter } from "../db/index.js";
import { enrichFavoriteWithCarpark } from "../helpers/favoriteCarparkHelper.js";

class FavoriteCarparkService {
  constructor(adapter = dynamoAdapter) {
    this.db = adapter;
    this.tableName = "favorites";
  }

  async addFavorite(userId, carparkId) {
    const favorite = new FavoriteCarpark({ userId, carparkId });
    await this.db.put(this.tableName, favorite.toDB());
    return favorite.toDB();
  }

  async getFavorites(userId) {
    const items = await this.db.query(this.tableName, { userId });
    return items.map((item) => {
      const favorite = FavoriteCarpark.fromDB(item);
      return enrichFavoriteWithCarpark(favorite);
    });
  }

  async removeFavorite(userId, carparkId) {
    await this.db.delete(this.tableName, { userId, carparkId });
    return true;
  }

  async isFavorite(userId, carparkId) {
    const item = await this.db.get(this.tableName, { userId, carparkId });
    return item !== null;
  }
}

export default FavoriteCarparkService;
