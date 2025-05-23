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
import { useAuth } from "./supabase/useAuth";
import { useSupabase } from "./supabase/useSupabase";
import { Database } from "../types/supabase";
import { ProfileRow } from "../types/profile";

type ProfileContextType = {
  profile: ProfileRow | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

type ProfileProviderProps = {
  children: ReactNode;
};

export const ProfileProvider = ({
  children,
}: ProfileProviderProps) => {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching profile with ID:", user.id);
      
      // First try to get profile by ID
      let { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // If no profile found by ID, try to find one by email
      if (profileError && profileError.code === 'PGRST116' && user.email) {
        console.log("Profile not found by ID, searching by email:", user.email);
        
        const { data: emailProfileData, error: emailProfileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", user.email)
          .single();
          
        if (!emailProfileError && emailProfileData) {
          console.log("Found profile by email:", emailProfileData);
          
          // Update the profile ID to match the user ID
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ id: user.id })
            .eq("id", emailProfileData.id);
            
          if (updateError) {
            console.error("Error updating profile ID:", updateError);
          } else {
            // Re-fetch the profile with the updated ID
            const { data: updatedData } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .single();
              
            if (updatedData) {
              data = updatedData;
              profileError = null;
            }
          }
        }
      }

      if (profileError) {
        console.error("Supabase error fetching profile:", profileError);
        
        // If error is 'not found', the profile might need to be created
        if (profileError.code === 'PGRST116') {
          console.log("Profile not found, creating a new one");
          
          // Create a new profile
          const newProfile = {
            id: user.id,
            email: user.email,
            name: user.email?.split('@')[0] || 'New User',
            is_complete: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            skills: [],
            interests: [],
            seeking_skills: [],
            experience: [],
            education: []
          };
          
          console.log("Inserting new profile:", newProfile);
          
          // Before inserting, check if email already exists
          const { data: existingEmail, error: emailCheckError } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", user.email)
            .maybeSingle();
            
          if (existingEmail) {
            console.log("Email already exists, updating that profile instead:", existingEmail);
            
            // Update the existing profile's ID to match the user's ID
            const { error: updateError } = await supabase
              .from("profiles")
              .update({ id: user.id })
              .eq("id", existingEmail.id);
              
            if (updateError) {
              console.error("Error updating existing profile:", updateError);
              throw new Error(`Failed to update existing profile: ${updateError.message}`);
            }
            
            // Fetch the updated profile
            const { data: updatedProfile, error: fetchError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .single();
              
            if (fetchError) {
              throw new Error(`Failed to fetch updated profile: ${fetchError.message}`);
            }
            
            setProfile(updatedProfile as ProfileRow);
            return;
          }
          
          // If no existing email, proceed with insert
          const { data: insertedData, error: insertError } = await supabase
            .from("profiles")
            .insert(newProfile)
            .select();
            
          if (insertError) {
            console.error("Error creating profile:", insertError);
            throw new Error(insertError.message);
          }
          
          if (!insertedData || insertedData.length === 0) {
            throw new Error("Failed to create profile");
          }
          
          console.log("Profile created successfully:", insertedData[0]);
          setProfile(insertedData[0] as ProfileRow);
          return;
        }
        
        throw new Error(profileError.message);
      }
      
      console.log("Profile fetched successfully:", data);
      
      // Ensure required arrays exist
      if (data) {
        if (!data.skills) data.skills = [];
        if (!data.interests) data.interests = [];
        if (!data.seeking_skills) data.seeking_skills = [];
        if (!data.experience) data.experience = [];
        if (!data.education) data.education = [];
        
        // Ensure is_complete flag is properly set
        if (data.is_complete === null) {
          data.is_complete = false;
          
          // Update the database
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ is_complete: false })
            .eq("id", user.id);
            
          if (updateError) {
            console.error("Error updating is_complete flag:", updateError);
          }
        }
      }
      
      setProfile(data as ProfileRow);
    } catch (err) {
      console.error("Error in fetchProfile:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  // Initial profile fetch when user changes
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile, user]);

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
