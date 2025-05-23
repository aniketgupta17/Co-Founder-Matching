import os
import sys
import requests
import json
from dotenv import load_dotenv

# Check if a filename was provided as a command-line argument
if len(sys.argv) < 2:
    print("Usage: python apply_migration.py <sql_filename>")
    sys.exit(1)

# Get the SQL filename from command-line arguments
sql_filename = sys.argv[1]
# Check if the file exists in the current directory first
if os.path.exists(sql_filename):
    sql_filepath = sql_filename
else:
    # Try looking in the scripts directory relative to the current location
    sql_filepath = os.path.join(os.path.dirname(__file__), sql_filename)
    if not os.path.exists(sql_filepath):
        print(f"Error: SQL file '{sql_filename}' not found in current directory or scripts directory")
        sys.exit(1)

# Load environment variables from .env file
load_dotenv()

# Get Supabase URL and API key from environment variables
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
    sys.exit(1)

# Read the SQL file
try:
    with open(sql_filepath, 'r') as f:
        sql_query = f.read()
except Exception as e:
    print(f"Error reading SQL file: {str(e)}")
    sys.exit(1)

# Execute the SQL query using Supabase REST API
try:
    print(f"Executing SQL from file: {sql_filename}")
    
    # Use the SQL endpoint of Supabase REST API
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "params=single-object"
    }
    
    # Construct the REST API URL for the rpc endpoint
    rest_url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    
    # Prepare the payload with the SQL query
    payload = {
        "query": sql_query
    }
    
    # Make the POST request
    response = requests.post(rest_url, headers=headers, json=payload)
    
    # Check for success
    if response.status_code == 200:
        print(f"Successfully executed SQL from {sql_filename}")
        
        # Print response data if available
        try:
            data = response.json()
            if data:
                print("Response:")
                print(json.dumps(data, indent=2))
        except:
            pass
        
        sys.exit(0)
    else:
        print(f"Error executing SQL: Status code {response.status_code}")
        print(f"Response: {response.text}")
        sys.exit(1)
except Exception as e:
    print(f"Error executing SQL: {str(e)}")
    sys.exit(1) 