export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chat_members: {
        Row: {
          chat_id: number | null
          created_at: string
          id: number
          user_id: string | null
        }
        Insert: {
          chat_id?: number | null
          created_at?: string
          id?: number
          user_id?: string | null
        }
        Update: {
          chat_id?: number | null
          created_at?: string
          id?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_members_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string
          id: number
          is_group: boolean
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          is_group: boolean
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          is_group?: boolean
          name?: string | null
        }
        Relationships: []
      }
      education_list: {
        Row: {
          degree: string | null
          graduation_year: string | null
          id: number
          institution: string | null
        }
        Insert: {
          degree?: string | null
          graduation_year?: string | null
          id?: number
          institution?: string | null
        }
        Update: {
          degree?: string | null
          graduation_year?: string | null
          id?: number
          institution?: string | null
        }
        Relationships: []
      }
      goals_list: {
        Row: {
          goal_name: string
          id: number
        }
        Insert: {
          goal_name: string
          id?: number
        }
        Update: {
          goal_name?: string
          id?: number
        }
        Relationships: []
      }
      interest_list: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      match_requests: {
        Row: {
          created_at: string
          id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          id: string
          matched_at: string | null
          status: string | null
          user_1: string | null
          user_2: string | null
          user_3: string | null
        }
        Insert: {
          id?: string
          matched_at?: string | null
          status?: string | null
          user_1?: string | null
          user_2?: string | null
          user_3?: string | null
        }
        Update: {
          id?: string
          matched_at?: string | null
          status?: string | null
          user_1?: string | null
          user_2?: string | null
          user_3?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          chat_id: number | null
          content: Json | null
          id: string
          sent_at: string | null
          user_id: string | null
        }
        Insert: {
          chat_id?: number | null
          content?: Json | null
          id?: string
          sent_at?: string | null
          user_id?: string | null
        }
        Update: {
          chat_id?: number | null
          content?: Json | null
          id?: string
          sent_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          availability: string | null
          avatar_url: string | null
          bio: string | null
          collab_style: string | null
          created_at: string | null
          email: string | null
          id: string
          industry: string | null
          location: string | null
          name: string | null
          seeking_skills: string[] | null
          startup_stage: string | null
          time_commitment: string | null
        }
        Insert: {
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          collab_style?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          industry?: string | null
          location?: string | null
          name?: string | null
          seeking_skills?: string[] | null
          startup_stage?: string | null
          time_commitment?: string | null
        }
        Update: {
          availability?: string | null
          avatar_url?: string | null
          bio?: string | null
          collab_style?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          name?: string | null
          seeking_skills?: string[] | null
          startup_stage?: string | null
          time_commitment?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          creator_id: string | null
          description: string | null
          id: string
          industry: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          title?: string
        }
        Relationships: []
      }
      skill_list: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          goal_id: number
          user_id: string
        }
        Insert: {
          goal_id: number
          user_id: string
        }
        Update: {
          goal_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_goals_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals_list"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interests: {
        Row: {
          interest_id: number
          user_id: string
        }
        Insert: {
          interest_id: number
          user_id: string
        }
        Update: {
          interest_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "interest_list"
            referencedColumns: ["id"]
          },
        ]
      }
      user_match: {
        Row: {
          match_status: string | null
          matched_user_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          match_status?: string | null
          matched_user_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          match_status?: string | null
          matched_user_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          skill_id: number
          user_id: string
        }
        Insert: {
          skill_id: number
          user_id: string
        }
        Update: {
          skill_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skill_list"
            referencedColumns: ["id"]
          },
        ]
      }
      users_education: {
        Row: {
          education_id: number | null
          user_id: string
        }
        Insert: {
          education_id?: number | null
          user_id: string
        }
        Update: {
          education_id?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_education_education_id_fkey"
            columns: ["education_id"]
            isOneToOne: false
            referencedRelation: "education_list"
            referencedColumns: ["id"]
          },
        ]
      }
      users_work_experiences: {
        Row: {
          user_id: string
          work_id: number
        }
        Insert: {
          user_id: string
          work_id: number
        }
        Update: {
          user_id?: string
          work_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "users_work_experiences_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "work_experience_list"
            referencedColumns: ["id"]
          },
        ]
      }
      work_experience_list: {
        Row: {
          company: string | null
          id: number
          position: string | null
          years: number | null
        }
        Insert: {
          company?: string | null
          id: number
          position?: string | null
          years?: number | null
        }
        Update: {
          company?: string | null
          id?: number
          position?: string | null
          years?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      skills:
        | "Programming"
        | "Design"
        | "Marketing"
        | "Finance"
        | "Sales"
        | "Operations"
        | "Research"
        | "Product"
      time_commitment: "Casual" | "Full-time" | "Part-time"
      user_type: "student" | "alumni" | "staff" | "industry"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      skills: [
        "Programming",
        "Design",
        "Marketing",
        "Finance",
        "Sales",
        "Operations",
        "Research",
        "Product",
      ],
      time_commitment: ["Casual", "Full-time", "Part-time"],
      user_type: ["student", "alumni", "staff", "industry"],
    },
  },
} as const
