// src/contexts/ProfileContext.tsx
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { Profile } from "../types/profile";

type ProfileContextType = {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

type ProfileProviderProps = {
  children: ReactNode;
  supabase: SupabaseClient;
};

export const ProfileProvider = ({
  children,
  supabase,
}: ProfileProviderProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(userError?.message || "User not found");
      }

      console.log("Fetching profile with ID:", user.id);
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id);

      if (profileError) {
        console.error("Supabase error fetching profile:", profileError);
        throw new Error(profileError.message);
      }
      console.log("Profile data:", data[0]);
      
      // Ensure profile has the is_complete field properly set
      if (data && data[0]) {
        // If is_complete is null, explicitly set it to false
        if (data[0].is_complete === null) {
          data[0].is_complete = false;
          
          // Also update the database
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ is_complete: false })
            .eq("id", user.id);
            
          if (updateError) {
            console.error("Error updating is_complete flag:", updateError);
          } else {
            console.log("Set is_complete to false for incomplete profile");
          }
        }
      }
      
      setProfile(data[0] as Profile);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Initial profile fetch on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Auth state change listener
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, _) => {
        console.log("Auth event occurred:", event);
        if (event === "SIGNED_IN") {
          fetchProfile();
        }
        if (event === "SIGNED_OUT") {
          setProfile(null);
          setError(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]); // Added fetchProfile to dependencies

  const value = {
    profile,
    loading,
    error,
    refreshProfile: fetchProfile,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};

// Custom hook to use the profile context
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
