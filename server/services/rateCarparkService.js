// RateCarparkService.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

class RateCarparkService {
  constructor() {
    const client = new DynamoDBClient({ region: "ap-southeast-1" });
    this.db = DynamoDBDocumentClient.from(client);
    this.tableName = "rating"; // DynamoDB table for ratings
  }

  // Rate a carpark with userId
  async rateCarpark(carparkId, userId, rating, comment) {
    // 1. Get current rating info
    const getParams = {
      TableName: this.tableName,
      Key: { carparkId },
    };
    const current = await this.db.send(new GetCommand(getParams));

    let newAvgRating = rating;
    let newTotalRatings = 1;
    let newComments = [{ userId, comment }];

    if (current.Item) {
      const { averageRating, totalRatings, comments } = current.Item;
      newTotalRatings = totalRatings + 1;
      newAvgRating = (averageRating * totalRatings + rating) / newTotalRatings;
      newComments = comments ? [...comments, { userId, comment }] : [{ userId, comment }];
    }

    // 2. Put or update the item
    const putParams = {
      TableName: this.tableName,
      Item: {
        carparkId,
        averageRating: newAvgRating,
        totalRatings: newTotalRatings,
        comments: newComments,
      },
    };

    await this.db.send(new PutCommand(putParams));
    return { carparkId, averageRating: newAvgRating, totalRatings: newTotalRatings };
  }

  // Get carpark rating
  async getCarparkRating(carparkId) {
    const params = {
      TableName: this.tableName,
      Key: { carparkId },
    };
    const result = await this.db.send(new GetCommand(params));

    if (!result.Item) {
      return { carparkId, averageRating: 0, totalRatings: 0, comments: [] };
    }

    return result.Item;
  }
}

export default RateCarparkService;

// Test the RateCarparkService
// async function testRateCarpark() {
//   const service = new RateCarparkService();
//   const carparkId = "A70";

//   console.log("=== Adding first rating ===");
//   let result = await service.rateCarpark(carparkId, "Aboyang", 4, "Easy to find parking spots.");
//   console.log(result);

//   console.log("=== Adding second rating ===");
//   result = await service.rateCarpark(carparkId, "Yang", 5, "Very convenient location.");
//   console.log(result);

//   console.log("=== Adding third rating ===");
//   result = await service.rateCarpark(carparkId, "Jay", 3, "Can get crowded during peak hours.");
//   console.log(result);

//   console.log("=== Fetching current rating ===");
//   const currentRating = await service.getCarparkRating(carparkId);
//   console.log(currentRating);
// }

// testRateCarpark()
//   .then(() => console.log("Test completed"))
//   .catch(err => console.error("Test failed:", err));