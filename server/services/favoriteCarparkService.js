import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { carparkDB } from "../utils/carparkDB.js";
import { Carpark } from "../models/carpark.js";
import { FavoriteCarpark } from "../models/favoriteCarpark.js";

class FavoriteCarparkService {
  constructor() {
    const client = new DynamoDBClient({ region: "ap-southeast-1" });
    this.db = DynamoDBDocumentClient.from(client);
    this.tableName = "favorites";
  }

  async addFavorite(userId, carparkId) {
    const favorite = new FavoriteCarpark({ userId, carparkId });

    await this.db.send(new PutCommand({
      TableName: this.tableName,
      Item: favorite.toDB(),
    }));

    return favorite.toDB();
  }

  async getFavorites(userId) {
    const result = await this.db.send(new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": userId },
    }));

    const favorites = result.Items || [];

    // Reuse Carpark entity — kills the duplicated operating hours + coord logic
    return favorites.map((item) => {
      const favorite = FavoriteCarpark.fromDB(item);
      const raw = carparkDB.find((c) => c.car_park_no === favorite.carparkId);
      const carpark = new Carpark(raw);
      return favorite.toJSON(carpark);
    });
  }

  async removeFavorite(userId, carparkId) {
    await this.db.send(new DeleteCommand({
      TableName: this.tableName,
      Key: { userId, carparkId },
    }));
    return true;
  }

  async isFavorite(userId, carparkId) {
    const result = await this.db.send(new GetCommand({
      TableName: this.tableName,
      Key: { userId, carparkId },
    }));
    return !!result.Item;
  }
}

export default FavoriteCarparkService;