// src/contexts/ProfileContext.tsx
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { Profile } from "../types/profile";
import { ProfileRowUpdate } from "../types/profile";
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

  const updateProfile = async (profileUpdate: ProfileRowUpdate) => {
    if (!profile) {
      console.error("No active profile");
      return;
    }

    try {
      // Update with timestamp
      const updateWithTimestamp = {
        ...profileUpdate,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from("profiles")
        .update(updateWithTimestamp)
        .eq("id", profile.id)
        .select();

      if (error) {
        console.error("Supabase error updating profile:", error);
        return;
      }

      if (!data) {
        console.error("No profile update data returned");
        return;
      }
      setProfile(data[0]);
    } catch (error) {
      console.error("Uncaught profile update error:", error);
      return;
    }
  };

  const fetchProfile = async () => {
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
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Supabase error fetching profile:", profileError);
        throw new Error(profileError.message);
      }

      setProfile(data as Profile);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, _) => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          console.log("Change event occured");
          fetchProfile();
          console.log("Change event fetched profile:", profile);
        }
        if (event === "SIGNED_OUT") {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, [supabase]);

  const value = {
    profile,
    loading,
    error,
    updateProfile,
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
