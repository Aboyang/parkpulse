import { vi, describe, test, expect, beforeEach } from "vitest";
import FavoriteCarparkService from "../services/favoriteCarparkService.js";

vi.mock("../data/carparkDB.js", () => ({
  carparkDB: [
    {
      car_park_no: "CP1",
      address: "123 Test Street",
      x_coord: "1.3048",
      y_coord: "103.8318",
    },
  ],
}));

describe("FavoriteCarparkService", () => {
  let service;
  let adapter;

  beforeEach(() => {
    adapter = {
      put: vi.fn(),
      get: vi.fn(),
      query: vi.fn(),
      delete: vi.fn(),
    };
    service = new FavoriteCarparkService(adapter);
  });

  test("addFavorite saves and returns the favorite item", async () => {
    adapter.put.mockResolvedValue(undefined);

    const result = await service.addFavorite("user123", "CP1");

    expect(adapter.put).toHaveBeenCalledOnce();
    expect(adapter.put).toHaveBeenCalledWith(
      "favorites",
      expect.objectContaining({ userId: "user123", carparkId: "CP1" })
    );
    expect(result).toMatchObject({ userId: "user123", carparkId: "CP1" });
  });

  test("getFavorites returns enriched carpark data for a user", async () => {
    adapter.query.mockResolvedValue([{ userId: "user123", carparkId: "CP1" }]);

    const result = await service.getFavorites("user123");

    expect(adapter.query).toHaveBeenCalledOnce();
    expect(adapter.query).toHaveBeenCalledWith("favorites", { userId: "user123" });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ carparkId: "CP1" });
  });

  test("getFavorites returns empty array when user has no favorites", async () => {
    adapter.query.mockResolvedValue([]);

    const result = await service.getFavorites("user123");

    expect(result).toEqual([]);
  });

  test("removeFavorite calls adapter.delete and returns true", async () => {
    adapter.delete.mockResolvedValue(undefined);

    const result = await service.removeFavorite("user123", "CP1");

    expect(adapter.delete).toHaveBeenCalledOnce();
    expect(adapter.delete).toHaveBeenCalledWith("favorites", {
      userId: "user123",
      carparkId: "CP1",
    });
    expect(result).toBe(true);
  });

  test("isFavorite returns true when item exists", async () => {
    adapter.get.mockResolvedValue({ userId: "user123", carparkId: "CP1" });

    const result = await service.isFavorite("user123", "CP1");

    expect(result).toBe(true);
  });

  test("isFavorite returns false when item does not exist", async () => {
    adapter.get.mockResolvedValue(null);

    const result = await service.isFavorite("user123", "CP1");

    expect(result).toBe(false);
  });
});
