import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { CarparkRating } from "../models/carparkRating.js";

class RateCarparkService {
  constructor() {
    const client = new DynamoDBClient({ region: "ap-southeast-1" });
    this.db = DynamoDBDocumentClient.from(client);
    this.tableName = "rating";
  }

  async rateCarpark(carparkId, userId, rating, comment) {
    const current = await this.db.send(new GetCommand({
      TableName: this.tableName,
      Key: { carparkId },
    }));

    // Rehydrate or create fresh entity
    const carparkRating = current.Item
      ? CarparkRating.fromDB(current.Item)
      : CarparkRating.empty(carparkId);

    // Business logic now lives on the entity
    carparkRating.addRating(userId, rating, comment);

    await this.db.send(new PutCommand({
      TableName: this.tableName,
      Item: carparkRating.toDB(),
    }));

    return carparkRating.toJSON();
  }

  async getCarparkRating(carparkId) {
    const result = await this.db.send(new GetCommand({
      TableName: this.tableName,
      Key: { carparkId },
    }));

    if (!result.Item) return CarparkRating.empty(carparkId).toJSON();

    return CarparkRating.fromDB(result.Item).toJSON();
  }
}

export default RateCarparkService;