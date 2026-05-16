import { PutCommand, GetCommand, QueryCommand, DeleteCommand, type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { docClient } from "./dynamoClient.js";
import type { DbAdapter } from "../types/db.js";

export function createDynamoAdapter(client: DynamoDBDocumentClient): DbAdapter {
  return {
    async put(table: string, item: Record<string, unknown>): Promise<Record<string, unknown>> {
      await client.send(new PutCommand({ TableName: table, Item: item }));
      return item;
    },

    async get(table: string, key: Record<string, unknown>): Promise<Record<string, unknown> | null> {
      const result = await client.send(new GetCommand({ TableName: table, Key: key }));
      return (result.Item as Record<string, unknown> | undefined) ?? null;
    },

    async query(table: string, partialKey: Record<string, unknown>): Promise<Record<string, unknown>[]> {
      const entries = Object.entries(partialKey);
      if (entries.length !== 1) {
        throw new Error("dynamoAdapter.query: expected exactly one partition-key field");
      }
      const firstEntry = entries[0];
      if (!firstEntry) throw new Error("dynamoAdapter.query: empty partialKey");
      const [attr, value] = firstEntry;
      const result = await client.send(new QueryCommand({
        TableName: table,
        KeyConditionExpression: `${attr} = :v`,
        ExpressionAttributeValues: { ":v": value },
      }));
      return (result.Items as Record<string, unknown>[] | undefined) ?? [];
    },

    async delete(table: string, key: Record<string, unknown>): Promise<void> {
      await client.send(new DeleteCommand({ TableName: table, Key: key }));
    },
  };
}

export const dynamoAdapter: DbAdapter = createDynamoAdapter(docClient);
