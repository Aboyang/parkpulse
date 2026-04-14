import axios from "axios";

const BASE_URL = "http://localhost:3000/api/auth";

(async () => {
  try {
    console.log(">>> Starting API E2E टेस्ट...\n");

    // --- Step 1: Sign Up ---
    const email = `test_${Date.now()}@example.com`;
    const password = "Test1234!";
    const name = "Test User";

    console.log(">>> Signing up...");
    const signupRes = await axios.post(`${BASE_URL}/signup`, {
      email,
      password,
      name,
    });

    console.log("Signup:", signupRes.data);

    // --- Step 2: Login ---
    console.log("\n>>> Logging in...");
    const loginRes = await axios.post(`${BASE_URL}/login`, {
      email,
      password,
    });

    console.log("Login:", loginRes.data);

    const { userId, accessToken } = loginRes.data;

    // --- Step 3: Get Profile ---
    console.log("\n>>> Fetching profile...");
    const profileRes = await axios.get(`${BASE_URL}/profile/${userId}`);
    console.log("Profile:", profileRes.data);

    // --- Step 4: Logout ---
    console.log("\n>>> Logging out...");
    const logoutRes = await axios.post(`${BASE_URL}/logout`, {
      accessToken,
    });

    console.log("Logout:", logoutRes.data);

  } catch (error) {
    console.error("API Test Failed:");
    console.error(error.response?.data || error.message);
  }
})();