import { vi, describe, test, expect, beforeEach } from "vitest";
import axios from "axios";
import CarparkAvailabilityService from "../services/carparkService.js";

// 1. Tell Vitest to mock the axios module
vi.mock("axios");

describe("CarparkAvailabilityService", () => {
  let service;

  beforeEach(() => {
    service = new CarparkAvailabilityService();
    vi.clearAllMocks();
  });

  test("getGeocode returns formatted address and coordinates on success", async () => {
    const mockResponse = {
      data: {
        results: [
          {
            ADDRESS: "123 ORCHARD ROAD",
            X: "1.3048",
            Y: "103.8318",
          },
        ],
      },
    };

    axios.get.mockResolvedValue(mockResponse);

    const result = await service.getGeocode("Orchard Road");

    expect(result).toEqual({
      formattedAddress: "123 ORCHARD ROAD",
      latitude: 1.3048,
      longitude: 103.8318,
    });

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("searchVal=Orchard%20Road"),
      expect.any(Object)
    );
  });

  test("getGeocode throws an error when no results are found", async () => {
    axios.get.mockResolvedValue({ data: { results: [] } });

    await expect(service.getGeocode("Invalid Place")).rejects.toThrow("Address not found");
  });
});