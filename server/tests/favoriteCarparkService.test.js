import { vi, describe, test, expect, beforeEach } from "vitest";
import FavoriteCarparkService from "../services/favoriteCarparkService.js";

// Mock AWS SDK
vi.mock("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient: vi.fn().mockImplementation(function() {
    return {};
  }),
}));

vi.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocumentClient: {
    from: vi.fn().mockReturnValue({ send: vi.fn() }),
  },
  PutCommand: vi.fn(),
  QueryCommand: vi.fn(),
  DeleteCommand: vi.fn(),
  GetCommand: vi.fn(),
}));

// Mock carparkDB
vi.mock("../utils/carparkDB.js", () => ({
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
  let mockSend;

  beforeEach(() => {
    service = new FavoriteCarparkService();
    mockSend = vi.fn();
    service.db = { send: mockSend };
    vi.clearAllMocks();
  });

  test("addFavorite saves and returns the favorite item", async () => {
    mockSend.mockResolvedValue({});

    const result = await service.addFavorite("user123", "CP1");

    expect(mockSend).toHaveBeenCalledOnce();
    expect(result).toMatchObject({ userId: "user123", carparkId: "CP1" });
  });

  test("getFavorites returns enriched carpark data for a user", async () => {
    mockSend.mockResolvedValue({
      Items: [{ userId: "user123", carparkId: "CP1" }],
    });

    const result = await service.getFavorites("user123");

    expect(mockSend).toHaveBeenCalledOnce();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ carparkId: "CP1" });
  });

  test("getFavorites returns empty array when user has no favorites", async () => {
    mockSend.mockResolvedValue({ Items: [] });

    const result = await service.getFavorites("user123");

    expect(result).toEqual([]);
  });

  test("removeFavorite calls DeleteCommand and returns true", async () => {
    mockSend.mockResolvedValue({});

    const result = await service.removeFavorite("user123", "CP1");

    expect(mockSend).toHaveBeenCalledOnce();
    expect(result).toBe(true);
  });

  test("isFavorite returns true when item exists", async () => {
    mockSend.mockResolvedValue({ Item: { userId: "user123", carparkId: "CP1" } });

    const result = await service.isFavorite("user123", "CP1");

    expect(result).toBe(true);
  });

  test("isFavorite returns false when item does not exist", async () => {
    mockSend.mockResolvedValue({});

    const result = await service.isFavorite("user123", "CP1");

    expect(result).toBe(false);
  });
});