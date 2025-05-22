import { BASE_URL } from "../config/api";
import { ProfileRow } from "../types/profile";

export async function fetchRecommendedMatches(accessToken: string | null) {
  try {
    const url = `${BASE_URL}/matches/recommend?count=5`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch recommended matches");

    const responseData = await response.json();
    console.log(responseData);
    return responseData.data as ProfileRow[];
  } catch (error) {
    console.error("Failed to fetch recommended matches:", error);
    return;
  }
}
