from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL: str = os.getenv("SUPABASE_URL")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY")

# test
# print("SUPABASE_URL:", SUPABASE_URL)
# print("SUPABASE_KEY starts with:", SUPABASE_KEY[:10] if SUPABASE_KEY else "None")


supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
