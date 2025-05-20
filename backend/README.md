# Co-Founder Matching Platform Backend

This is the backend for the Co-Founder Matching Platform, built with Flask and Supabase.

## Current Status

### Working Features
- ✅ User authentication (signup/login)
- ✅ User profile viewing
- ✅ Listing all profiles
- ✅ Simplified auth that doesn't rely on Supabase Auth

### Not Working / Needs Setup
- ❌ Creating profiles (table exists but schema mismatch)
- ❌ Conversations (table doesn't exist)
- ❌ Messages (table exists but empty)

## Database Schema

Based on our testing, the Supabase instance has:

1. `profiles` table: Contains user profiles with fields:
   - `id`, `user_id`, `name`, `email`, `bio`, `avatar_url`, `location`
   - `industry`, `collab_style`, `startup_stage`, `time_commitment`, `availability`
   - `created_at`
   - Note: Does NOT have `skills`, `interests`, or `seeking_skills` as arrays

2. `messages` table: Exists but is empty

3. `conversations` table: Does not exist at all

## Testing

Use the provided test scripts to test the functionality:

```bash
# Minimal test script that focuses on working features
./test_minimal.sh
```

This will:
1. Register a test user or log in an existing one
2. Get user information
3. List profiles
4. Get information about the database schema

## Manual Testing

After running the test script, you can use the provided token to make API calls:

```bash
export TOKEN="your_token_here"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5001/api/v1/profiles | python -m json.tool
```

## Next Steps

To make the system fully functional:

1. Create the `conversations` table in Supabase:
   ```sql
   CREATE TABLE conversations (
       id UUID PRIMARY KEY,
       user_id_1 UUID NOT NULL,
       user_id_2 UUID NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. Update the profile creation to match the existing schema (remove arrays)

3. If arrays are needed for skills/interests/seeking_skills, consider creating separate tables or using text fields with comma-separated values

4. Ensure permission settings in Supabase allow the necessary operations

## Configuration

Environment variables:
- `FLASK_APP=app.wsgi:app`
- `FLASK_DEBUG=1` (for development)

## Running the Server

```bash
cd backend
export FLASK_APP=app.wsgi:app
export FLASK_DEBUG=1
python -m flask run --host=0.0.0.0 --port=5001
``` 