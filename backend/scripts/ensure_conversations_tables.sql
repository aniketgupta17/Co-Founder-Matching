-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create conversations table if it doesn't exist
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id_1 UUID NOT NULL REFERENCES profiles(id),
    user_id_2 UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now(),
    last_message_text TEXT,
    last_message_at TIMESTAMPTZ
);

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add foreign keys after both tables exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_conversation_id'
    ) THEN
        ALTER TABLE messages 
        ADD CONSTRAINT fk_conversation_id 
        FOREIGN KEY (conversation_id) 
        REFERENCES conversations(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_sender_id'
    ) THEN
        ALTER TABLE messages 
        ADD CONSTRAINT fk_sender_id 
        FOREIGN KEY (sender_id) 
        REFERENCES profiles(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_receiver_id'
    ) THEN
        ALTER TABLE messages 
        ADD CONSTRAINT fk_receiver_id 
        FOREIGN KEY (receiver_id) 
        REFERENCES profiles(id);
    END IF;
END $$;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversations_user_id_1 ON conversations(user_id_1);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id_2 ON conversations(user_id_2);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);

-- Consider unread messages
CREATE TABLE IF NOT EXISTS message_reads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id UUID NOT NULL,
    user_id UUID NOT NULL,
    read_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add foreign keys for message_reads after the table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_message_reads_message_id'
    ) THEN
        ALTER TABLE message_reads 
        ADD CONSTRAINT fk_message_reads_message_id 
        FOREIGN KEY (message_id) 
        REFERENCES messages(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_message_reads_user_id'
    ) THEN
        ALTER TABLE message_reads 
        ADD CONSTRAINT fk_message_reads_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id);
    END IF;
END $$;

-- Add unique constraint for message_reads if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'message_reads_message_id_user_id_key'
    ) THEN
        ALTER TABLE message_reads 
        ADD CONSTRAINT message_reads_message_id_user_id_key 
        UNIQUE (message_id, user_id);
    END IF;
END $$;

-- Create index for faster unread message lookups
CREATE INDEX IF NOT EXISTS idx_message_reads_user_id ON message_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_message_id ON message_reads(message_id); 