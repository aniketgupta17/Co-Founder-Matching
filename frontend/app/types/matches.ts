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
  avatarUrl?: string | null;
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
    avatarUrl: matchRow.image,
  };
};

export interface ProfileData {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  location?: string;
  lookingForCofounders: boolean;
  fullTimeStartup: boolean;
  foundedCompany: boolean;
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    logo?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
    logo?: string;
  }>;
  skills: string[];
  interests: string[];
  currentProject?: {
    title: string;
    description: string;
  };
}

export function mapApiToProfileData(apiData: any): ProfileData {
  return {
    id: apiData.id,
    name: apiData.name || "",
    avatar: apiData.avatar_url || undefined,
    role: apiData.role || undefined,
    location: apiData.location || undefined,
    lookingForCofounders: apiData.seeking_skills?.length > 0 || false,
    fullTimeStartup: apiData.time_commitment === "Full-time",
    foundedCompany: false, // No such field in API data, set default or infer if possible
    experience: (apiData.experience || []).map((exp: any) => ({
      company: exp.company || "",
      role: exp.role || "",
      duration: exp.duration || "",
      logo: exp.logo || undefined,
    })),
    education: (apiData.education || []).map((edu: any) => ({
      institution: edu.institution || "",
      degree: edu.degree || "",
      year: edu.year || "",
      logo: edu.logo || undefined,
    })),
    skills: apiData.skills || [],
    interests: apiData.interests || [],
    currentProject: apiData.currentProject
      ? {
          title: apiData.currentProject.title || "",
          description: apiData.currentProject.description || "",
        }
      : undefined,
  };
}
