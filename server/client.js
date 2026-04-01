import axios from "axios";

const API_URL = "http://localhost:3000/api/carparks";

// Function to fetch carparks
async function getCarparks(address, radius) {
  try {
    const response = await axios.get(API_URL, {
      params: {
        address,
        radius
      }
    });
    console.log("Data:", response.data);
  } catch (error) {
    if (error.response) {
      console.error("Error:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

// Example usage
getCarparks("Ang Mo Kio", 500);