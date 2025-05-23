import { Database } from "./supabase";

export type MatchRow = Database["public"]["Tables"]["matches"]["Row"];
export type EnrichedMatchRow =
  Database["public"]["Views"]["enriched_matches"]["Row"];

export interface Match {
  id: string;
  name: string;
  role: string | null;
  image: string | null;
  bio: string | null;
  skills: string[];
  interests: string[];
  userId: string;
}

export const matchRowToMatch = (matchRow: EnrichedMatchRow): Match => {
  if (!matchRow.id) {
    throw Error("No match row ID");
  }

  if (!matchRow.matched_user_id) {
    throw Error("No match user ID");
  }

  return {
    id: matchRow.id,
    name: matchRow.name || "Unknown",
    role: matchRow.industry,
    image: matchRow.image || null,
    bio: matchRow.bio || null,
    skills: (matchRow.skills as string[]) || [],
    interests: (matchRow.interests as string[]) || [],
    userId: matchRow.matched_user_id,
  };
};
