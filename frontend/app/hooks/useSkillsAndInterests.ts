import { SupabaseClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { fallbackInterests, fallbackSkills } from "../types/profile";

export const useSkillsAndInterests = (supabase: SupabaseClient) => {
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);

  const fetchInterestOptions = async () => {
    try {
      const { data, error } = await supabase
        .from("interests_list")
        .select("name");

      if (error || !data)
        throw error ? error : new Error("Failed to fetch interests");

      return data.map((row) => row["name"]);
    } catch (error) {
      console.error("Uncaught interest fetching error:", error);
      return fallbackInterests;
    }
  };

  const fetchSkillOptions = async () => {
    try {
      const { data, error } = await supabase.from("skills_list").select("name");

      if (error || !data)
        throw error ? error : new Error("Failed to fetch skills");

      return data.map((row) => row["name"]);
    } catch (error) {
      console.error("Uncaught skill fetching error:", error);
      return fallbackSkills;
    }
  };

  useEffect(() => {
    const fetchOptions = async () => {
      const interestsData = await fetchInterestOptions();
      const skillsData = await fetchSkillOptions();
      setInterests(interestsData);
      setSkills(skillsData);
    };

    fetchOptions();
  }, []);

  return { skills, interests };
};
