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

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
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

  // Initial fetch on mount
  useEffect(() => {
    fetchProfile();
  }, []);

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
