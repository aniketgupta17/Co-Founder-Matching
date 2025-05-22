import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./supabase";
import { fetchRecommendedMatches } from "../services/matchService";
import { ProfileRow } from "../types/profile";

export const useRecommendedMatches = () => {
  const [recommendedMatches, setRecommendedMatches] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const loadRecommendedMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get access token from the session
      const accessToken = session?.access_token || null;
      
      console.log("Attempting to fetch recommended matches with token:", accessToken ? "Present" : "Missing");
      
      // Use the match service to fetch recommended profiles
      const matches = await fetchRecommendedMatches(accessToken);
      
      if (matches && matches.length > 0) {
        console.log(`Successfully fetched ${matches.length} recommended matches`);
        setRecommendedMatches(matches);
      } else {
        console.log("No matches found or matches array is empty");
        setRecommendedMatches([]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load recommended matches";
      setError(errorMsg);
      console.error("Error loading recommended matches:", err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Load matches on mount and when session changes
  useEffect(() => {
    if (session) {
      loadRecommendedMatches();
    } else {
      setRecommendedMatches([]);
      setLoading(false);
    }
  }, [session, loadRecommendedMatches]);

  // Return the recommended matches, loading state, error, and a refresh function
  return {
    recommendedMatches,
    loading,
    error,
    refresh: loadRecommendedMatches
  };
}; 