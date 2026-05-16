// Cachcing frequently accessed carpark data using Redis to improve performance and reduce load on the database.
// We empty the cache every 2 minutes to ensure data freshness while still benefiting from caching.

import { createClient } from "redis";

const client = createClient({ url: process.env.REDIS_URL ?? "redis://localhost:6379" });

client.on("error", (err: Error) => {
    console.error("Redis error:", err);
});

await client.connect();

// Get cached data by key, return null if not found
export async function getCache(key: string): Promise<unknown | null> {
    const data = await client.get(key);
    return data ? JSON.parse(data) as unknown : null;
}

// Set cache with key, value and TTL (time to live) in seconds (default 120s)
export async function setCache(key: string, value: unknown, ttl = 120): Promise<void> {
    await client.set(key, JSON.stringify(value), {
        EX: ttl,
    });
}
