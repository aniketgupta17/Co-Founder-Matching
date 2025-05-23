import requests
import time
import uuid
import json
from datetime import datetime

# API Base URL
BASE_URL = "http://127.0.0.1:8000/api/v1"

def print_step(step_name):
    print(f"\n{'=' * 20} {step_name} {'=' * 20}")

def print_response(response):
    try:
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Status Code: {response.status_code}")
        print(f"Raw Response: {response.text}")

def test_api_flow():
    """Test the complete API flow for the Co-Founder Matching application."""
    # Generate a unique email for the test
    timestamp = int(time.time())
    test_email = f"test_user_{timestamp}@example.com"
    test_password = "Test@123"
    test_name = f"Test User {timestamp}"
    
    # Access token for authenticated requests
    access_token = None
    user_id = None
    
    # Store IDs for resources created during the test
    profile_id = None
    match_id = None
    conversation_id = None
    
    results = {
        "signup": False,
        "login": False,
        "profile_creation": False,
        "matchmaking": False,
        "match_action": False,
        "conversation": False,
        "messaging": False
    }
    
    # Step 1: User Registration
    print_step("1. User Registration (Signup)")
    
    signup_data = {
        "email": test_email,
        "password": test_password,
        "name": test_name
    }
    
    response = requests.post(f"{BASE_URL}/auth/signup", json=signup_data)
    print_response(response)
    
    if response.status_code == 201:
        print("✅ User registration successful")
        result = response.json()
        access_token = result.get("token")  # Get JWT token
        user_id = result.get("user", {}).get("id")
        print(f"User ID: {user_id}")
        if access_token:
            print(f"Access Token: {access_token[:10]}...")
            results["signup"] = True
        else:
            print("❌ No access token returned")
    else:
        print("❌ User registration failed")
    
    # Step 2: User Login
    print_step("2. User Login")
    
    login_data = {
        "email": test_email,
        "password": test_password
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print_response(response)
    
    if response.status_code == 200:
        print("✅ User login successful")
        result = response.json()
        access_token = result.get("token")  # Get JWT token
        user_id = result.get("user", {}).get("id")
        print(f"User ID: {user_id}")
        if access_token:
            print(f"Access Token: {access_token[:10]}...")
            results["login"] = True
        else:
            print("❌ No access token returned")
    else:
        print("❌ User login failed")
    
    if not access_token:
        print("❌ Cannot proceed with further tests without authentication")
        return results
    
    # Authentication headers for subsequent requests
    auth_headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # Step 3: Create profile
    print_step("3. Create User Profile")
    
    profile_data = {
        "name": test_name,
        "bio": "I'm a software developer looking for a co-founder with marketing expertise",
        "location": "San Francisco, CA",
        "industry": "Technology",
        "skills": ["Python", "JavaScript", "React", "API Development"],
        "interests": ["EdTech", "HealthTech", "AI"],
        "collab_style": "Remote",
        "startup_stage": "Idea/Concept",
        "time_commitment": "Part-time",
        "availability": "Evenings and weekends",
        "seeking_skills": ["Marketing", "Business Development", "Sales"]
    }
    
    response = requests.post(f"{BASE_URL}/profiles", json=profile_data, headers=auth_headers)
    print_response(response)
    
    if response.status_code == 200 or response.status_code == 201:
        print("✅ Profile creation successful")
        profile_data = response.json()
        profile_id = profile_data.get("profile", {}).get("id")
        if not profile_id and "id" in profile_data:
            profile_id = profile_data.get("id")
        print(f"Profile ID: {profile_id}")
        results["profile_creation"] = True
    else:
        print("❌ Profile creation failed")
    
    # Get profile to verify
    print_step("4. Verify User Profile")
    response = requests.get(f"{BASE_URL}/me/profile", headers=auth_headers)
    print_response(response)
    
    if response.status_code == 200:
        print("✅ Profile retrieval successful")
    else:
        print("❌ Profile retrieval failed")
    
    # Step 4: Get Recommended Matches
    print_step("5. Get Recommended Matches")
    
    response = requests.get(f"{BASE_URL}/matches/recommend", headers=auth_headers)
    print_response(response)
    
    matches = []
    if response.status_code == 200:
        matches = response.json()
        if matches and len(matches) > 0:
            print(f"✅ Got {len(matches)} recommended matches")
            match_id = matches[0].get("user_id")  # Use the first match
            print(f"Will use match ID: {match_id}")
            results["matchmaking"] = True
        else:
            print("ℹ️ No matches found - this is expected if there are no other users")
    else:
        print("❌ Failed to get matches")
    
    # Create a test user for direct matching if no matches found
    if not matches or len(matches) == 0:
        print_step("Creating a test user for direct matching")
        alt_email = f"alt_user_{timestamp}@example.com"
        alt_password = "Alt@123"
        alt_name = f"Alt User {timestamp}"
        
        # Register the test user
        alt_signup_data = {
            "email": alt_email,
            "password": alt_password,
            "name": alt_name
        }
        
        alt_response = requests.post(f"{BASE_URL}/auth/signup", json=alt_signup_data)
        if alt_response.status_code == 201:
            alt_result = alt_response.json()
            alt_user_id = alt_result.get("user", {}).get("id")
            alt_token = alt_result.get("token")
            print(f"✅ Created test user with ID: {alt_user_id}")
            
            # Create profile for the test user
            if alt_token:
                alt_headers = {
                    "Authorization": f"Bearer {alt_token}",
                    "Content-Type": "application/json"
                }
                
                alt_profile_data = {
                    "name": alt_name,
                    "bio": "I'm a marketing expert looking for a technical co-founder",
                    "location": "New York, NY",
                    "industry": "Marketing",
                    "skills": ["Marketing", "Sales", "Business Development"],
                    "interests": ["E-commerce", "HealthTech", "AI"],
                    "collab_style": "Remote",
                    "startup_stage": "Idea/Concept",
                    "time_commitment": "Full-time",
                    "availability": "Weekdays",
                    "seeking_skills": ["Programming", "Product Development"]
                }
                
                alt_profile_response = requests.post(f"{BASE_URL}/profiles", json=alt_profile_data, headers=alt_headers)
                if alt_profile_response.status_code == 200 or alt_profile_response.status_code == 201:
                    print("✅ Alt user profile created successfully")
                    
                    # Try direct matching with this user
                    direct_match_data = {
                        "user_id": alt_user_id
                    }
                    
                    match_response = requests.post(f"{BASE_URL}/matches/direct", json=direct_match_data, headers=auth_headers)
                    if match_response.status_code == 200 or match_response.status_code == 201:
                        print("✅ Direct match created successfully")
                        match_id = match_response.json().get("id")
                        if not match_id:
                            match_id = alt_user_id
                        print(f"Match ID: {match_id}")
                        results["matchmaking"] = True
                    else:
                        print("❌ Direct match creation failed")
                else:
                    print("❌ Alt user profile creation failed")
        else:
            print("❌ Alt user creation failed")
    
    # Step 5: Take action on a match
    print_step("6. Take Action on Match")
    
    if match_id:
        match_action_data = {
            "action": "accept"
        }
        
        response = requests.post(f"{BASE_URL}/matches/{match_id}/action", json=match_action_data, headers=auth_headers)
        print_response(response)
        
        if response.status_code == 200:
            print("✅ Match action successful")
            results["match_action"] = True
            # If the match is now connected, we should have a conversation
            if response.json().get("status") == "connected":
                conversation_id = response.json().get("conversation", {}).get("id")
                print(f"Conversation ID: {conversation_id}")
                results["conversation"] = True
        else:
            print("❌ Match action failed")
    else:
        print("ℹ️ Skipping match action since no match was found or created")
    
    # Step 6: Create conversation (if not already created)
    print_step("7. Create or Get Conversation")
    
    if not conversation_id and match_id:
        conversation_data = {
            "user_id": match_id
        }
        
        response = requests.post(f"{BASE_URL}/conversations", json=conversation_data, headers=auth_headers)
        print_response(response)
        
        if response.status_code == 200 or response.status_code == 201:
            print("✅ Conversation creation/retrieval successful")
            conversation_id = response.json().get("id")
            print(f"Conversation ID: {conversation_id}")
            results["conversation"] = True
        else:
            print("❌ Conversation creation failed")
    
    # Step 7: Send a message in the conversation
    print_step("8. Send Message in Conversation")
    
    if conversation_id:
        message_data = {
            "content": f"Hello, I'm interested in discussing a potential partnership! My test message sent at {datetime.now().isoformat()}"
        }
        
        response = requests.post(f"{BASE_URL}/conversations/{conversation_id}/messages", json=message_data, headers=auth_headers)
        print_response(response)
        
        if response.status_code == 201:
            print("✅ Message sent successfully")
            message_id = response.json().get("id")
            print(f"Message ID: {message_id}")
            results["messaging"] = True
        else:
            print("❌ Message sending failed")
        
        # Get conversation messages
        print("\nRetrieving messages:")
        response = requests.get(f"{BASE_URL}/conversations/{conversation_id}/messages", headers=auth_headers)
        print_response(response)
        
        if response.status_code == 200:
            print("✅ Message retrieval successful")
            messages = response.json()
            print(f"Retrieved {len(messages)} messages")
        else:
            print("❌ Message retrieval failed")
    else:
        print("ℹ️ Skipping message sending since no conversation was created")
    
    # Summary of results
    print_step("TEST RESULTS SUMMARY")
    for step, success in results.items():
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{step.replace('_', ' ').title()}: {status}")
    
    print("\n=== Test Completed ===")
    print(f"Test user email: {test_email}")
    print(f"Test user ID: {user_id}")
    
    return results


if __name__ == "__main__":
    test_api_flow() 