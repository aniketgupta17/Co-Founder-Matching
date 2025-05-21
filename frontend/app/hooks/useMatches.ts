import { SupabaseClient } from "@supabase/supabase-js";
import { Match, matchRowToMatch } from "../types/matches";
import { useCallback, useEffect, useState } from "react";
import { useProfile } from "./useProfile";
import { EnrichedMatchRow } from "../types/matches";
export const useMatches = (supabase: SupabaseClient) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const { profile } = useProfile();

  if (!profile) {
    throw Error("useMatches requires profile to be set");
  }

  const fetchMatches = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("created_at");

      if (error) {
        console.error("Supabase error fetching matches:", error);
        return;
      }

      if (!data) {
        console.warn("No match data returned");
        return;
      }

      const newMatches = data.map((row: EnrichedMatchRow) => {
        return matchRowToMatch(row);
      });

      setMatches(newMatches);
    } catch (error) {
      console.error("Unknown error fetching matches:", error);
      return;
    }
  }, [supabase]);

  useEffect(() => {
    fetchMatches();
  }, [supabase, profile]);

  return { matches };
};
