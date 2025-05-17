#!/usr/bin/env python3
"""
run_tests.py

Combined script to start a Flask app and test its endpoints.
"""

import os
import sys
import time
import threading
import requests
import json
from app import create_app

# Configuration
HOST = '127.0.0.1'
PORT = 5000
BASE_URL = f"http://{HOST}:{PORT}/api/v1"

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
        "email": "uma.williams@example.org",
        "password": "password123"  # Any password works with our mock
    }
    
    # Print request details
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

def run_flask_app():
    """Run the Flask app in a separate thread."""
    app = create_app()
    app.run(host=HOST, port=PORT)

def run_tests():
    """Run all the API tests."""
    # Wait for the Flask app to start up
    time.sleep(2)
    
    print("Starting API tests...")
    
    # First, authenticate to get a token
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
    # Start the Flask app in a separate thread
    app_thread = threading.Thread(target=run_flask_app)
    app_thread.daemon = True
    app_thread.start()
    
    try:
        # Run the tests
        run_tests()
    except KeyboardInterrupt:
        print("\nTests interrupted by user.")
    except Exception as e:
        print(f"\nError during tests: {e}")
    finally:
        print("Test run complete.")


def test_profiles2():
    """Test profile endpoints."""
    print("\n📋 Testing Profile Endpoints...")

    print(BASE_URL)

    # Get all profiles
    response = requests.get(f"{BASE_URL}/profiles")
    print_response(response, "Get All Profiles")
def test_matching():
    """Test profile endpoints."""
    print("\n📋 Testing Profile Endpoints...")

    print(BASE_URL)

    # Get all profiles
    response = requests.get(f"{BASE_URL}/profiles")
    print_response(response, "Get All Profiles")
def test_get_all_profiles():
    """Test profile endpoints."""
    print("\n📋 Testing Profile Endpoints...")

    print(BASE_URL)

    # Get all profiles
    response = requests.get(f"{BASE_URL}/profiles")
    print_response(response, "Get All Profiles")


def test_login_test():
    """Test login endpoint and return the auth token."""
    print("\n🔑 Testing Authentication...")

    login_data = {
        "email": "uma.williams@example.org",
        "password": "password123"  # Any password works with our mock
    }

    # Print request details
    print(f"POST {BASE_URL}/login")
    print(f"Request Body: {json.dumps(login_data)}")

    try:
        response = requests.post(f"{BASE_URL}/login", json=login_data)
        print_response(response, "Login")

        if response.status_code == 200:
            return response.json().get('token')
        return None
    except requests.exceptions.RequestException as e:
        print(f"Error making request: {e}")
        return None


def test_users(token):
    """Test user endpoints."""
    print("\n👤 Auth_me...")

    headers = {"Authorization": f"Bearer {token}"}

    # Get all users
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print_response(response, "Auth_me")
def test_users_token_refresh(token):
    """Test user endpoints."""
    print("\n👤 Testing Refresh Token...")

    headers = {"Authorization": f"Bearer {token}"}

    # refresh Token
    response = requests.get(f"{BASE_URL}/refresh", headers=headers)
    print_response(response, "Testing Refresh Token")

def test_users_matches(token):
    """Test  Matches."""
    print("\n👤 Test  Matches...")

    headers = {"Authorization": f"Bearer {token}"}

    # refresh Token
    response = requests.get(f"{BASE_URL}/matches", headers=headers)
    print_response(response, "Test  Matches")
def test_matches_id(token,match_id):
    """Test  Matches."""
    print("\n👤 Test  Matches ID...")

    headers = {"Authorization": f"Bearer {token}"}

    # refresh Token
    response = requests.get(f"{BASE_URL}/matches/{match_id}", headers=headers)
    print_response(response, "Test  Matches ID")
def test_login_all():
    token=test_login_test()
    #test_users(token)
    # print(token)
    #test_users_token_refresh(token)
    test_matches_id(token,"05f14afc-c009-4943-8c6f-abbce56df036")


