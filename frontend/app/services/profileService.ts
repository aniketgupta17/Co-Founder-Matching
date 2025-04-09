import { getSupabaseClient } from "../hooks/supabase";
import { Database } from "types/supabase";
const supabase = getSupabaseClient();

type ProfileUpdate = Partial<
  Database["public"]["Tables"]["profiles"]["Update"]
>;

export async function updateProfile(userId: string, updates: ProfileUpdate) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { sucess: false, error };
  }
}
