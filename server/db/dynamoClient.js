import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const REGION = "ap-southeast-1";

const rawClient = new DynamoDBClient({ region: REGION });
export const docClient = DynamoDBDocumentClient.from(rawClient);
