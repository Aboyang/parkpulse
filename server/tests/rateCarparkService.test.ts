import { vi, describe, test, expect, beforeEach } from "vitest";
import RateCarparkService from "../services/rateCarparkService.js";
import type { DbAdapter } from "../types/db.js";

describe("RateCarparkService", () => {
  let service: RateCarparkService;
  let adapter: { get: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    adapter = {
      get: vi.fn(),
      put: vi.fn(),
    };
    service = new RateCarparkService(adapter as unknown as DbAdapter);
  });

  describe("rateCarpark", () => {
    test("creates a new rating when carpark has no existing ratings", async () => {
      adapter.get.mockResolvedValue(null);
      adapter.put.mockResolvedValue(undefined);

      const result = await service.rateCarpark("CP1", "user123", 4, "Great carpark");

      expect(adapter.get).toHaveBeenCalledWith("rating", { carparkId: "CP1" });
      expect(adapter.put).toHaveBeenCalledWith(
        "rating",
        expect.objectContaining({
          carparkId: "CP1",
          totalRatings: 1,
          averageRating: 4,
          comments: [{ userId: "user123", comment: "Great carpark" }],
        })
      );
      expect(result).toMatchObject({
        carparkId: "CP1",
        totalRatings: 1,
        averageRating: 4,
        comments: [{ userId: "user123", comment: "Great carpark" }],
      });
    });

    test("adds to existing ratings and recalculates average", async () => {
      adapter.get.mockResolvedValue({
        carparkId: "CP1",
        averageRating: 4,
        totalRatings: 1,
        comments: [{ userId: "user456", comment: "Good" }],
      });
      adapter.put.mockResolvedValue(undefined);

      const result = await service.rateCarpark("CP1", "user123", 2, "Too crowded");

      expect(result.totalRatings).toBe(2);
      expect(result.averageRating).toBe(3); // (4 + 2) / 2
      expect(result.comments).toHaveLength(2);
      expect(result.comments[1]).toEqual({ userId: "user123", comment: "Too crowded" });
    });

    test("calls put with the updated carpark rating", async () => {
      adapter.get.mockResolvedValue(null);
      adapter.put.mockResolvedValue(undefined);

      await service.rateCarpark("CP1", "user123", 5, "Perfect");

      expect(adapter.put).toHaveBeenCalledOnce();
    });
  });

  describe("getCarparkRating", () => {
    test("returns existing rating for a carpark", async () => {
      adapter.get.mockResolvedValue({
        carparkId: "CP1",
        averageRating: 3.5,
        totalRatings: 2,
        comments: [
          { userId: "user1", comment: "Okay" },
          { userId: "user2", comment: "Fine" },
        ],
      });

      const result = await service.getCarparkRating("CP1");

      expect(adapter.get).toHaveBeenCalledWith("rating", { carparkId: "CP1" });
      expect(result).toMatchObject({
        carparkId: "CP1",
        averageRating: 3.5,
        totalRatings: 2,
        comments: [
          { userId: "user1", comment: "Okay" },
          { userId: "user2", comment: "Fine" },
        ],
      });
    });

    test("returns empty rating when carpark has no ratings", async () => {
      adapter.get.mockResolvedValue(null);

      const result = await service.getCarparkRating("CP1");

      expect(result).toMatchObject({
        carparkId: "CP1",
        averageRating: 0,
        totalRatings: 0,
        comments: [],
      });
    });
  });
});
