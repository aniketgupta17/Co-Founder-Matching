-- Create UUID extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE,
    raw_user_meta_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    name TEXT,
    email TEXT,
    bio TEXT,
    avatar_url TEXT,
    location TEXT,
    industry TEXT,
    collab_style TEXT,
    startup_stage TEXT,
    time_commitment TEXT,
    availability TEXT,
    interests JSONB DEFAULT '[]'::jsonb,
    skills JSONB DEFAULT '[]'::jsonb,
    seeking_skills JSONB DEFAULT '[]'::jsonb,
    is_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create matches table if it doesn't exist
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    matched_user_id UUID NOT NULL,
    related_match_id UUID, -- To link bidirectional matches
    compatibility_score FLOAT,
    explanation TEXT,
    status TEXT DEFAULT 'pending',
    rejected_at TIMESTAMPTZ, -- Track when a match was rejected (for 30-day cooldown)
    rejection_reason TEXT, -- Store the reason for rejection
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create conversations table if it doesn't exist
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id_1 UUID NOT NULL,
    user_id_2 UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add columns to profiles table if they don't exist
DO $$ 
BEGIN
    -- Add interests column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'interests') THEN
        ALTER TABLE profiles ADD COLUMN interests JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    -- Add skills column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'skills') THEN
        ALTER TABLE profiles ADD COLUMN skills JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    -- Add seeking_skills column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'seeking_skills') THEN
        ALTER TABLE profiles ADD COLUMN seeking_skills JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    -- Add collab_style column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'collab_style') THEN
        ALTER TABLE profiles ADD COLUMN collab_style TEXT;
    END IF;
    
    -- Add startup_stage column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'startup_stage') THEN
        ALTER TABLE profiles ADD COLUMN startup_stage TEXT;
    END IF;
    
    -- Add time_commitment column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'time_commitment') THEN
        ALTER TABLE profiles ADD COLUMN time_commitment TEXT;
    END IF;
    
    -- Add availability column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'availability') THEN
        ALTER TABLE profiles ADD COLUMN availability TEXT;
    END IF;
    
    -- Add industry column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'industry') THEN
        ALTER TABLE profiles ADD COLUMN industry TEXT;
    END IF;
    
    -- Add location column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'location') THEN
        ALTER TABLE profiles ADD COLUMN location TEXT;
    END IF;
    
    -- Add bio column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE profiles ADD COLUMN bio TEXT;
    END IF;
    
    -- Add is_complete column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_complete') THEN
        ALTER TABLE profiles ADD COLUMN is_complete BOOLEAN DEFAULT false;
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;
    
    -- Add rejected_at column to matches if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'rejected_at') THEN
        ALTER TABLE matches ADD COLUMN rejected_at TIMESTAMPTZ;
    END IF;
    
    -- Add related_match_id column to matches if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'related_match_id') THEN
        ALTER TABLE matches ADD COLUMN related_match_id UUID;
    END IF;
    
    -- Add rejection_reason column to matches if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'rejection_reason') THEN
        ALTER TABLE matches ADD COLUMN rejection_reason TEXT;
    END IF;
END $$; 