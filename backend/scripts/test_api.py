#!/usr/bin/env python3
"""
test_api.py

Script to test the backend API endpoints using requests.
"""

import requests
import json
import sys
import time

BASE_URL = "http://localhost:5001/api/v1"

def print_response(response, title=None):
    """Print a formatted API response."""
    if title:
        print(f"\n=== {title} ===")
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {response.headers}")
    if response.text:
        try:
            pretty_json = json.dumps(response.json(), indent=2)
            print(f"Response Body:\n{pretty_json}")
        except json.JSONDecodeError:
            print(f"Response Body: {response.text}")
    print("-" * 80)

def test_login():
    """Test login endpoint and return the auth token."""
    print("\n🔑 Testing Authentication...")
    
    login_data = {
        "email": "tech@example.com",
        "password": "password123"  # Any password works with our mock
    }
    
    print(f"POST {BASE_URL}/auth/login")
    print(f"Request Body: {json.dumps(login_data)}")
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print_response(response, "Login")
        
        if response.status_code == 200:
            return response.json().get('token')
        return None
    except requests.exceptions.RequestException as e:
        print(f"Error making request: {e}")
        return None

# Try another endpoint - health check
def test_health():
    print("\n🏥 Testing Health Endpoint...")
    try:
        response = requests.get("http://localhost:5001/health")
        print_response(response, "Health Check")
        return response.status_code == 200
    except requests.exceptions.RequestException as e:
        print(f"Error making request: {e}")
        return False

def test_users(token):
    """Test user endpoints."""
    print("\n👤 Testing User Endpoints...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get all users
    response = requests.get(f"{BASE_URL}/users", headers=headers)
    print_response(response, "Get All Users")
    
    # Get a specific user
    response = requests.get(f"{BASE_URL}/users/1", headers=headers)
    print_response(response, "Get User by ID (1)")
    
    # Get a user by email
    response = requests.get(f"{BASE_URL}/users/email/business@example.com", headers=headers)
    print_response(response, "Get User by Email (business@example.com)")
    
    # Get current user
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print_response(response, "Get Current User")

def test_profiles(token):
    """Test profile endpoints."""
    print("\n📋 Testing Profile Endpoints...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get all profiles
    response = requests.get(f"{BASE_URL}/profiles", headers=headers)
    print_response(response, "Get All Profiles")
    
    # Get a specific profile
    response = requests.get(f"{BASE_URL}/profiles/2", headers=headers)
    print_response(response, "Get Profile by ID (2)")
    
    # Get profile for a specific user
    response = requests.get(f"{BASE_URL}/users/3/profile", headers=headers)
    print_response(response, "Get Profile by User ID (3)")
    
    # Get current user's profile
    response = requests.get(f"{BASE_URL}/me/profile", headers=headers)
    print_response(response, "Get Current User's Profile")

def test_matching(token):
    """Test matching endpoints."""
    print("\n🤝 Testing Matching Endpoints...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get recommended matches
    response = requests.get(f"{BASE_URL}/matches/recommend", headers=headers)
    print_response(response, "Get Recommended Matches")
    
    # Generate matches for all users (admin function)
    response = requests.post(f"{BASE_URL}/matches/generate-all", headers=headers)
    print_response(response, "Generate Matches for All Users")
    
    # Get all matches for current user
    response = requests.get(f"{BASE_URL}/matches", headers=headers)
    print_response(response, "Get All Matches for Current User")
    
    # If we have matches, test getting a specific match and taking action on it
    matches = response.json()
    if matches and len(matches) > 0:
        match_id = matches[0]['id']
        
        # Get a specific match
        response = requests.get(f"{BASE_URL}/matches/{match_id}", headers=headers)
        print_response(response, f"Get Match by ID ({match_id})")
        
        # Take action on a match
        action_data = {"action": "accept"}
        response = requests.post(f"{BASE_URL}/matches/{match_id}/action", 
                                headers=headers, json=action_data)
        print_response(response, f"Take Action (accept) on Match {match_id}")
    
    # Test compatibility check
    compatibility_data = {"user_id": 2}  # Check compatibility with user 2
    response = requests.post(f"{BASE_URL}/matches/compatibility", 
                          headers=headers, json=compatibility_data)
    print_response(response, "Check Compatibility with User 2")

def main():
    """Run all tests."""
    print("Starting API tests...")
    
    # First test the health endpoint
    if not test_health():
        print("❌ Health check failed. API might not be running.")
        sys.exit(1)
        
    # Then authenticate to get a token
    token = test_login()
    if not token:
        print("❌ Authentication failed. Cannot proceed with other tests.")
        sys.exit(1)
    
    # Then run all other tests
    test_users(token)
    test_profiles(token)
    test_matching(token)
    
    print("\n✅ All tests completed!")

if __name__ == "__main__":
    main() 