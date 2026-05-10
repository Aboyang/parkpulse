import { PutCommand, GetCommand, QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "./dynamoClient.js";

/**
 * @typedef {Object} DbAdapter
 * @property {(table: string, item: object) => Promise<object>} put
 * @property {(table: string, key: object) => Promise<object|null>} get
 * @property {(table: string, partialKey: object) => Promise<object[]>} query
 * @property {(table: string, key: object) => Promise<void>} delete
 */

export function createDynamoAdapter(client) {
  return {
    async put(table, item) {
      await client.send(new PutCommand({ TableName: table, Item: item }));
      return item;
    },

    async get(table, key) {
      const result = await client.send(new GetCommand({ TableName: table, Key: key }));
      return result.Item ?? null;
    },

    async query(table, partialKey) {
      const entries = Object.entries(partialKey);
      if (entries.length !== 1) {
        throw new Error("dynamoAdapter.query: expected exactly one partition-key field");
      }
      const [attr, value] = entries[0];
      const result = await client.send(new QueryCommand({
        TableName: table,
        KeyConditionExpression: `${attr} = :v`,
        ExpressionAttributeValues: { ":v": value },
      }));
      return result.Items ?? [];
    },

    async delete(table, key) {
      await client.send(new DeleteCommand({ TableName: table, Key: key }));
    },
  };
}

export const dynamoAdapter = createDynamoAdapter(docClient);
