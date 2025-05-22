import { BASE_URL } from "../config/api";
import { ProfileRow } from "../types/profile";

export async function fetchRecommendedMatches(accessToken: string | null) {
  try {
    const url = `${BASE_URL}/matches/recommend?count=5`;
    console.log("Fetching recommended matches from:", url);
    console.log("Using access token:", accessToken ? "Yes" : "No");
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server responded with error:", response.status, errorText);
      throw new Error(`Failed to fetch recommended matches: ${response.status} ${errorText}`);
    }

    const responseData = await response.json();
    console.log("Received recommended matches:", responseData);
    return responseData.data as ProfileRow[];
  } catch (error) {
    console.error("Failed to fetch recommended matches:", error);
    // Return empty array instead of undefined so we can still render the UI
    return [];
  }
}
