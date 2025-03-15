import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function useSupabase() {
  // Return the Supabase client
  return supabase;
}