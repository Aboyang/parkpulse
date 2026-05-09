import axios from "axios";
import CarparkAvailabilityService from "../services/CarparkService";

// 1. Tell Jest to mock the axios module
jest.mock("axios");

describe("CarparkAvailabilityService", () => {
  let service;

  beforeEach(() => {
    service = new CarparkAvailabilityService();
    // Clear all mocks before each test
    jest.clearAllMocks(); 
  });

  test("getGeocode returns formatted address and coordinates on success", async () => {
    // 2. Setup the "Mock" response
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

    // Tell axios.get to return our mockResponse
    axios.get.mockResolvedValue(mockResponse);

    // 3. Act: Call the function
    const result = await service.getGeocode("Orchard Road");

    // 4. Assert: Check if the result is what we expected
    expect(result).toEqual({
      formattedAddress: "123 ORCHARD ROAD",
      latitude: 1.3048,
      longitude: 103.8318,
    });

    // Verify axios was called with the correct URL
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("searchVal=Orchard%20Road"),
      expect.any(Object)
    );
  });

  test("getGeocode throws an error when no results are found", async () => {
    // Mock an empty results array
    axios.get.mockResolvedValue({ data: { results: [] } });

    // Assert that the function throws the specific error
    await expect(service.getGeocode("Invalid Place")).rejects.toThrow("Address not found");
  });
});