import { createClient, SupabaseClient } from "@supabase/supabase-js";

// TODO fix environment variable handling
const supabaseUrl = process.env.SUPABASE_API_URL || "";
const supabaseApiKey = process.env.SUPABASE_KEY || "";

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseApiKey);
  }

  return supabaseInstance;
};

export function useSupabase() {
  const supabase = getSupabaseClient();

  return { supabase };
}
