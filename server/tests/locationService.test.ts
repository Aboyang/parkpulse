import { vi, describe, test, expect, beforeEach } from "vitest";
import LocationService from "../services/locationService.js";

describe("LocationService", () => {
  let service: LocationService;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    service = new LocationService();
    mockFetch = vi.fn();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  describe("getCurrentLocation", () => {
    test("returns lat/lng from ip-api response", async () => {
      mockFetch.mockResolvedValue({
        json: vi.fn().mockResolvedValue({ lat: 1.3048, lon: 103.8318 }),
      });

      const result = await service.getCurrentLocation();

      expect(fetch).toHaveBeenCalledWith("http://ip-api.com/json/");
      expect(result).toEqual({ lat: 1.3048, lng: 103.8318 });
    });

    test("normalizes lon to lng", async () => {
      mockFetch.mockResolvedValue({
        json: vi.fn().mockResolvedValue({ lat: 35.6762, lon: 139.6503 }),
      });

      const result = await service.getCurrentLocation();

      expect(result).toEqual({ lat: 35.6762, lng: 139.6503 });
      expect((result as Record<string, unknown>)?.lon).toBeUndefined();
    });

    test("returns null when fetch throws", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const result = await service.getCurrentLocation();

      expect(result).toBeNull();
    });

    test("returns null when json parsing fails", async () => {
      mockFetch.mockResolvedValue({
        json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
      });

      const result = await service.getCurrentLocation();

      expect(result).toBeNull();
    });
  });
});
