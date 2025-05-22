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
          chat_id: number
          created_at: string
          id: number
          user_id: string
        }
        Insert: {
          chat_id: number
          created_at?: string
          id?: number
          user_id: string
        }
        Update: {
          chat_id?: number
          created_at?: string
          id?: number
          user_id?: string
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
            foreignKeyName: "chat_members_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "enriched_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "enriched_chats"
            referencedColumns: ["user_id"]
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
      chat_reads: {
        Row: {
          chat_id: number | null
          id: number
          read_at: string
          user_id: string
        }
        Insert: {
          chat_id?: number | null
          id?: number
          read_at?: string
          user_id: string
        }
        Update: {
          chat_id?: number | null
          id?: number
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_reads_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_reads_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "enriched_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "enriched_chats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "chat_reads_user_id_fkey"
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
          last_message_id: string | null
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          is_group: boolean
          last_message_id?: string | null
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          is_group?: boolean
          last_message_id?: string | null
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_last_message_id_fkey"
            columns: ["last_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "enriched_chats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversation_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "enriched_chats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversation_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          updated_at: string | null
          user_id_1: string
          user_id_2: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string | null
          user_id_1: string
          user_id_2: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string | null
          user_id_1?: string
          user_id_2?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_1_fkey"
            columns: ["user_id_1"]
            isOneToOne: false
            referencedRelation: "enriched_chats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversations_user_id_1_fkey"
            columns: ["user_id_1"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user_id_2_fkey"
            columns: ["user_id_2"]
            isOneToOne: false
            referencedRelation: "enriched_chats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversations_user_id_2_fkey"
            columns: ["user_id_2"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      events: {
        Row: {
          created_at: string
          date: string
          description: string
          id: number
          location: string
          tags: string[]
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string
          date: string
          description: string
          id?: number
          location: string
          tags: string[]
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          description?: string
          id?: number
          location?: string
          tags?: string[]
          title?: string
          type?: string | null
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
            referencedRelation: "enriched_chats"
            referencedColumns: ["user_id"]
          },
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
          compatibility_score: number | null
          created_at: string | null
          explanation: string | null
          id: string
          matched_user_id: string
          rejected_at: string | null
          rejection_reason: string | null
          related_match_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          compatibility_score?: number | null
          created_at?: string | null
          explanation?: string | null
          id?: string
          matched_user_id: string
          rejected_at?: string | null
          rejection_reason?: string | null
          related_match_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          compatibility_score?: number | null
          created_at?: string | null
          explanation?: string | null
          id?: string
          matched_user_id?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          related_match_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          chat_id: number
          content: string | null
          id: string
          sent_at: string
          user_id: string
        }
        Insert: {
          chat_id: number
          content?: string | null
          id?: string
          sent_at?: string
          user_id: string
        }
        Update: {
          chat_id?: number
          content?: string | null
          id?: string
          sent_at?: string
          user_id?: string
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
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "enriched_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "enriched_chats"
            referencedColumns: ["user_id"]
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
      migrations: {
        Row: {
          applied_at: string
          description: string | null
          id: number
          name: string
        }
        Insert: {
          applied_at?: string
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          applied_at?: string
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
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
          interests: Json | null
          is_complete: boolean | null
          location: string | null
          name: string | null
          seeking_skills: Json | null
          skills: Json | null
          startup_stage: string | null
          time_commitment: string | null
          updated_at: string | null
          user_id: string | null
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
          interests?: Json | null
          is_complete?: boolean | null
          location?: string | null
          name?: string | null
          seeking_skills?: Json | null
          skills?: Json | null
          startup_stage?: string | null
          time_commitment?: string | null
          updated_at?: string | null
          user_id?: string | null
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
          interests?: Json | null
          is_complete?: boolean | null
          location?: string | null
          name?: string | null
          seeking_skills?: Json | null
          skills?: Json | null
          startup_stage?: string | null
          time_commitment?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey1"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      team_members: {
        Row: {
          id: string
          joined_at: string | null
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "enriched_chats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "enriched_chats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "teams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "user_goals_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      users: {
        Row: {
          aud: string | null
          banned_until: string | null
          confirmation_sent_at: string | null
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          email_change: string | null
          email_change_confirm_status: number | null
          email_change_sent_at: string | null
          email_change_token_current: string | null
          email_change_token_new: string | null
          email_confirmed_at: string | null
          encrypted_password: string | null
          id: string
          instance_id: string | null
          invited_at: string | null
          is_anonymous: boolean
          is_sso_user: boolean
          is_super_admin: boolean | null
          last_sign_in_at: string | null
          phone: string | null
          phone_change: string | null
          phone_change_sent_at: string | null
          phone_change_token: string | null
          phone_confirmed_at: string | null
          raw_app_meta_data: Json | null
          raw_user_meta_data: Json | null
          reauthentication_sent_at: string | null
          reauthentication_token: string | null
          recovery_sent_at: string | null
          recovery_token: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id: string
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean
          is_sso_user?: boolean
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id?: string
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean
          is_sso_user?: boolean
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      enriched_chat_members: {
        Row: {
          avatar_url: string | null
          chat_id: number | null
          created_at: string | null
          id: number | null
          name: string | null
          user_id: string | null
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
            foreignKeyName: "chat_members_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "enriched_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "enriched_chats"
            referencedColumns: ["user_id"]
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
      enriched_chats: {
        Row: {
          avatar_url: string | null
          chat_name: string | null
          created_at: string | null
          id: number | null
          is_group: boolean | null
          last_message_id: string | null
          last_message_text: string | null
          participants: number | null
          sent_at: string | null
          user_id: string | null
          user_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_last_message_id_fkey"
            columns: ["last_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_id_fkey1"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      enriched_matches: {
        Row: {
          bio: string | null
          compatibility_score: number | null
          created_at: string | null
          explanation: string | null
          id: string | null
          image: string | null
          industry: string | null
          interests: Json | null
          matched_user_id: string | null
          name: string | null
          rejected_at: string | null
          rejection_reason: string | null
          related_match_id: string | null
          skills: Json | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      unified_messages: {
        Row: {
          content: string | null
          conversation_id: string | null
          created_at: string | null
          id: string | null
          is_read: boolean | null
          receiver_id: string | null
          sender_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_chat_message: {
        Args: {
          _chat_id: number
          _user_id: string
          _content: string
          _sent_at: string
        }
        Returns: {
          message_id: string
          text: string
          sent_at: string
          sender_id: string
          sender_name: string
          sender_avatar_url: string
        }[]
      }
      create_private_chat: {
        Args: { _first_user_id: string; _second_user_id: string }
        Returns: number
      }
      find_chat_by_exact_members: {
        Args: { _user_ids: string[] }
        Returns: {
          chat_id: number
        }[]
      }
      get_chat_messages: {
        Args: { _chat_id: number }
        Returns: {
          id: string
          chat_id: number
          user_id: string
          content: string
          sent_at: string
          name: string
          avatar_url: string
        }[]
      }
      get_message_chats: {
        Args: { _chat_id: number }
        Returns: {
          id: string
          chat_id: number
          user_id: string
          avatar_url: string
          sent_at: string
          content: string
        }[]
      }
      get_user_by_id: {
        Args: { _user_id: string }
        Returns: {
          id: string
          email: string
        }[]
      }
      get_user_chats: {
        Args: { _user_id: string }
        Returns: {
          id: number
          created_at: string
          is_group: boolean
          name: string
          last_message: string
          last_message_timestamp: string
          members: Json
        }[]
      }
      get_user_group_chats: {
        Args: { _chat_id: number } | { _user_id: string }
        Returns: {
          id: number
          created_at: string
          is_group: boolean
          name: string
          last_message: string
          last_message_timestamp: string
          members: Json
        }[]
      }
      has_user_read_chat: {
        Args: { _chat_id: number }
        Returns: boolean
      }
      insert_message: {
        Args: {
          p_id: string
          p_conversation_id: string
          p_sender_id: string
          p_receiver_id: string
          p_content: string
          p_is_read: boolean
          p_created_at: string
        }
        Returns: string
      }
      insert_message_with_join: {
        Args: {
          _chat_id: string
          _sender_id: string
          _content: string
          _sent_at: string
        }
        Returns: {
          message_id: string
          content: string
          created_at: string
          sender_name: string
          sender_avatar_url: string
        }[]
      }
      is_chat_member: {
        Args: { _chat_id: number; _user_id: string }
        Returns: boolean
      }
      user_has_chat_access: {
        Args: { _chat_id: number; _user_id: string }
        Returns: boolean
      }
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
