import os
import sys
import logging
from dotenv import load_dotenv
import supabase

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Get Supabase credentials from environment variables
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("Supabase credentials not found in environment variables.")
    sys.exit(1)

# Initialize Supabase client
try:
    client = supabase.create_client(SUPABASE_URL, SUPABASE_KEY)
    logger.info("Supabase client initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize Supabase client: {str(e)}")
    sys.exit(1)

# Define table creation SQL statements
TABLES = {
    "profiles": """
    CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL,
        name TEXT,
        email TEXT,
        bio TEXT,
        avatar_url TEXT,
        location TEXT,
        industry TEXT,
        skills TEXT[],
        interests TEXT[],
        collab_style TEXT,
        startup_stage TEXT,
        time_commitment TEXT,
        availability TEXT,
        seeking_skills TEXT[],
        is_complete BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """,
    
    "matches": """
    CREATE TABLE IF NOT EXISTS matches (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL,
        matched_user_id UUID NOT NULL,
        status TEXT DEFAULT 'pending',
        compatibility_score FLOAT,
        explanation TEXT,
        rejected_at TIMESTAMP WITH TIME ZONE,
        rejection_reason TEXT,
        related_match_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """,
    
    "conversations": """
    CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY,
        user_id_1 UUID NOT NULL,
        user_id_2 UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """,
    
    "conversation_messages": """
    CREATE TABLE IF NOT EXISTS conversation_messages (
        id UUID PRIMARY KEY,
        conversation_id UUID NOT NULL,
        sender_id UUID NOT NULL,
        receiver_id UUID NOT NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """
}

def create_tables():
    """Create all required tables in the Supabase database."""
    try:
        # Create each table
        for table_name, sql in TABLES.items():
            try:
                logger.info(f"Creating/verifying table: {table_name}")
                # Check if table exists first
                try:
                    # Try to query the table to see if it exists
                    response = client.table(table_name).select('*').limit(1).execute()
                    logger.info(f"Table {table_name} already exists.")
                except Exception as e:
                    logger.warning(f"Error checking table {table_name}: {str(e)}")
                    logger.info(f"Note: You may need to manually create the {table_name} table using Supabase dashboard SQL editor")
                    logger.info(f"SQL for {table_name}: {sql}")
            except Exception as e:
                logger.error(f"Failed to create/verify table {table_name}: {str(e)}")
        
        logger.info("Database table verification completed.")
        logger.info("If any tables are missing, please use the Supabase dashboard SQL editor to create them.")
        logger.info("All required tables: profiles, matches, conversations, conversation_messages")
    except Exception as e:
        logger.error(f"An error occurred during table verification: {str(e)}")

if __name__ == "__main__":
    create_tables() 