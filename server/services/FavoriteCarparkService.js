// FavoriteService.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { carparkDB } from "../utils/carparkDB.js";
import { svy21ToLatLon } from "../utils/coordConverter.js";

class FavoriteCarparkService {
  constructor() {
    const client = new DynamoDBClient({ region: "ap-southeast-1" });
    this.db = DynamoDBDocumentClient.from(client);
    this.tableName = "favorites";
  }

  // Add favorite: only store userId + carparkId
  async addFavorite(userId, carparkId) {
    const params = {
      TableName: this.tableName,
      Item: {
        userId,
        carparkId,
        createdAt: new Date().toISOString(),
      },
    };

    await this.db.send(new PutCommand(params));

    return { userId, carparkId };
  }

  // Get all favorites and append info from carparkDB
  async getFavorites(userId) {
    const params = {
      TableName: this.tableName,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": userId },
    };

    const result = await this.db.send(new QueryCommand(params));
    const favorites = result.Items || [];

    // Append full carpark info from carparkDB
    const favoritesWithInfo = favorites.map(fav => {
      const carpark = carparkDB.find(c => c.car_park_no === fav.carparkId);

      // Determine operating hours
      let operating_hours = "Unknown";
      if (carpark.short_term_parking === "NO") {
        operating_hours = "Season parking only";
      } else if (
        carpark.short_term_parking === "WHOLE DAY" &&
        carpark.night_parking === "YES"
      ) {
        operating_hours = "24 hrs";
      } else {
        operating_hours = carpark.short_term_parking;
      }

      const { latitude: lat, longitude: lon } = svy21ToLatLon(
        parseFloat(carpark.x_coord),
        parseFloat(carpark.y_coord)
      );

      return {
        ...fav,
        carparkName: carpark?.address || "Unknown",
        latitude: lat,
        longitude: lon,
        operating_hours
      };
    });

    return favoritesWithInfo;
  }

  // Remove favorite
  async removeFavorite(userId, carparkId) {
    const params = {
      TableName: this.tableName,
      Key: { userId, carparkId },
    };

    await this.db.send(new DeleteCommand(params));
    return true;
  }

  // Check if favorite
  async isFavorite(userId, carparkId) {
    const params = {
      TableName: this.tableName,
      Key: { userId, carparkId },
    };

    const result = await this.db.send(new GetCommand(params));
    return !!result.Item;
  }
}

export default FavoriteCarparkService;