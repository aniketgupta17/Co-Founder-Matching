import { Database, Constants } from "./supabase";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
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
  role: string;
  image: string | null;
  bio: string;
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

export const profileRowToProfile = (profileRow: ProfileRow): Profile => {
  return {
    id: profileRow.id,
    name: profileRow.name,
    role: "Entrepreneur",
    image: profileRow.avatar_url,
    bio: profileRow.bio || "Bio",
    skills: (profileRow.skills as string[]) || ["Machine Learning", "Business"],
    interests: (profileRow.skills as string[]) || ["AI"],
    experience: [],
    education: [],
  };
};
