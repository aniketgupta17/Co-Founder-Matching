import { Database, Constants, Json } from "./supabase";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"] & {
  experience?: Json;
  education?: Json;
};
export type RawProfileRowUpdate =
  Database["public"]["Tables"]["profiles"]["Update"];

export type ProfileRowUpdate = Omit<
  RawProfileRowUpdate,
  "skills" | "seeking_skills" | "interests" | "name" | "bio" | "role"
> & {
  name?: string;
  bio?: string;
  industry?: string;
  role?: string;
  skills: string[];
  seeking_skills: string[];
  interests: string[];
  education?: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  experience?: Array<{
    company: string;
    role: string;
    duration: string;
  }>;
};

export const fallbackSkills = [
  "Python",
  "Node.js",
  "React",
  "Flutter",
  "AI",
  "DataScience",
  "Go",
  "Rust",
  "Sales",
  "Marketing",
  "Design",
  "Finance",
  "Pitching",
  "CivilEngineering",
  "MechanicalEngineering",
  "Biology",
  "Medicine",
  "Pharmacy",
  "Chemistry",
  "CAD",
  "LabResearch",
  "Automation",
];

export const fallbackInterests = [
  "SaaS",
  "GreenTech",
  "HealthTech",
  "FinTech",
  "EdTech",
  "Marketplace",
  "AR/VR",
  "Blockchain",
  "IoT",
  "MedTech",
  "BioTech",
  "Pharma",
  "Construction",
  "RenewableEnergy",
  "Aerospace",
  "Robotics",
  "UrbanPlanning",
];

// availability: string | null
// avatar_url: string | null
// bio: string | null
// collab_style: string | null
// created_at: string | null
// email: string | null
// id: string
// industry: string | null
// interests: Json | null
// is_complete: boolean | null
// location: string | null
// name: string | null
// seeking_skills: Json | null
// skills: Json | null
// startup_stage: string | null
// time_commitment: string | null
// updated_at: string | null
// user_id: string | null

export interface Profile {
  id: string;
  name: string | null;
  role: string | null;
  image: string | null;
  bio: string | null;
  skills: string[];
  interests: string[];
  experience: Array<{
    company: string;
    role: string;
    duration: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
}

/**
 * Safely parse a JSON field from the database
 */
function safeJsonParse(json: Json | null | undefined, defaultValue: any[] = []): any[] {
  if (!json) return defaultValue;
  
  if (Array.isArray(json)) {
    return json;
  }
  
  try {
    if (typeof json === 'string') {
      const parsed = JSON.parse(json);
      return Array.isArray(parsed) ? parsed : defaultValue;
    }
    return defaultValue;
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return defaultValue;
  }
}

export const profileRowToProfile = (profileRow: ProfileRow): Profile => {
  return {
    id: profileRow.id,
    name: profileRow.name || 'Anonymous User',
    role: profileRow.role || 'Entrepreneur',
    image: profileRow.avatar_url,
    bio: profileRow.bio || 'No bio provided',
    skills: safeJsonParse(profileRow.skills, []),
    interests: safeJsonParse(profileRow.interests, []),
    experience: safeJsonParse(profileRow.experience, []),
    education: safeJsonParse(profileRow.education, [])
  };
};
