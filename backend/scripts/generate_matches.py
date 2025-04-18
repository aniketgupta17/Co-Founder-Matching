#!/usr/bin/env python3
"""
generate_matches.py

Script to generate matches for all users and store them in the database.
This can be run as a scheduled task or one-time setup.
"""

import os
import sys
from pathlib import Path

# Add the parent directory to the path so we can import the app
parent_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(parent_dir))

from app import create_app
from app.services.matching_service import get_matching_service
from app.services.supabase_service import get_supabase_service

def generate_matches(app):
    """Generate matches for all users and store them in the database."""
    # Create an application context
    with app.app_context():
        print("Generating matches for all users...")
        matching_service = get_matching_service()
        supabase = get_supabase_service()
        
        # Generate matches
        matches = matching_service.generate_matches_for_all_users(top_n=5)
        print(f"Generated matches for {len(matches)} users.")
        
        # Store matches in the database
        stored_count = 0
        for user_id, user_matches in matches.items():
            for match in user_matches:
                # Store the match in the database
                stored_match = supabase.store_match(
                    int(user_id),
                    match['match_id'],
                    match['score'],
                    match['explanation']
                )
                if stored_match:
                    stored_count += 1
        
        print(f"Stored {stored_count} matches in the database.")
        return stored_count

if __name__ == "__main__":
    # Create the Flask app
    app = create_app()
    
    # Generate matches
    generate_matches(app) 