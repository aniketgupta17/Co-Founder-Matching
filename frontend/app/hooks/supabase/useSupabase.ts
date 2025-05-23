import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

// Use environment variables from expo-constants or fallback to empty strings
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || "";
const supabaseApiKey = Constants.expoConfig?.extra?.supabaseKey || "";

// Get mock auth setting from app.config.js
const USE_MOCK_AUTH = Constants.expoConfig?.extra?.useMockAuth || false;

// Log configuration details during initialization
console.log("Expo Config:", Constants.expoConfig?.extra);
console.log("Mock Auth Enabled:", USE_MOCK_AUTH);

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    // Log configuration info for debugging
    console.log("Supabase URL:", supabaseUrl ? "Configured" : "Missing");
    console.log("Supabase Key:", supabaseApiKey ? "Configured" : "Missing");
    
    // Use dummy values if credentials are missing
    const url = supabaseUrl || "https://example.supabase.co";
    const key = supabaseApiKey || "dummy-key-for-offline-mode";
    
    supabaseInstance = createClient(url, key);
  }

  return supabaseInstance;
};

export function useSupabase() {
  const supabase = getSupabaseClient();
  return { supabase, USE_MOCK_AUTH };
}
