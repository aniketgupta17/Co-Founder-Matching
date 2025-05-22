import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

// Use environment variables from expo-constants or fallback to empty strings
const supabaseUrl =
  Constants.expoConfig?.extra?.supabaseUrl ||
  process.env.SUPABASE_API_URL ||
  "";

const supabaseApiKey =
  Constants.expoConfig?.extra?.supabaseKey || process.env.SUPABASE_KEY || "";

// For development testing - use a flag to bypass real authentication
const USE_MOCK_AUTH = false; // Set to false when you have proper Supabase credentials

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    // Log configuration info for debugging
    console.log("Supabase URL:", supabaseUrl ? "Configured" : "Missing");
    console.log("Supabase Key:", supabaseApiKey ? "Configured" : "Missing");

    supabaseInstance = createClient(supabaseUrl, supabaseApiKey);
  }

  return supabaseInstance;
};

export function useSupabase() {
  const supabase = getSupabaseClient();
  return { supabase, USE_MOCK_AUTH };
}
