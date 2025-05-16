import logging
import os
from typing import Any, Dict, List, Optional

from app.core.config import Config, get_config

from flask import current_app
from supabase import create_client
from pydantic import BaseModel, model_validator, field_validator
import uuid


class ChatMembers(BaseModel):
    id: uuid
    name: str

    class Config:
        extra = "ignore"


class UserChatsRPC(BaseModel):
    id: int
    is_group: bool
    created_at: Any
    name: Optional[str] = None
    members: List[ChatMembers]


class SupabaseService:
    """Service for interacting with Supabase."""

    def __init__(self, config: Config):
        self.url = config.SUPABASE_URL
        self.key = config.SUPABASE_KEY
        self.client = create_client(supabase_url=self.url, supabase_key=self.key)

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        try:
            response = self.client.rpc(
                "get_user_by_id", {"_user_id": user_id}
            ).execute()

            if response.data and len(response.data) > 0:
                return response.data[0]

            return None

        except Exception as e:
            logging.error(f"Error getting user by ID: {e}")
            return None

    def get_user_chats(self, user_id: str) -> Optional[List[UserChatsRPC]]:
        try:
            response = self.client.rpc(
                "get_user_chats", {"_user_id": user_id}
            ).execute()

            if response.data and len(response.data) > 0:
                for chat in response:
                    if not chat.get("is_group"):
                        pass

            return None

        except Exception as e:
            logging.error(f"Error fetching user chats: {e}")
            return None

    # # User methods
    # def get_users(self):
    #     """Get all users from Supabase with complete profile data for matching."""
    #     if self.use_mock:
    #         return self.mock_users

    #     # Real Supabase implementation would normally be here
    #     return []

    # def get_user(self, user_id):
    #     """Get a specific user by ID with complete profile for matching."""
    #     if self.use_mock:
    #         user = next((u for u in self.mock_users if u["id"] == user_id), None)
    #         return user

    #     # Real Supabase implementation would normally be here
    #     return None

    # def get_user_by_email(self, email):
    #     """Get a user by email."""
    #     if self.use_mock:
    #         user = next((u for u in self.mock_users if u["email"] == email), None)
    #         return user

    #     # Real Supabase implementation would normally be here
    #     return None

    # # Profile methods
    # def get_profiles(self):
    #     """Get all profiles from Supabase."""
    #     if self.use_mock:
    #         return self.mock_profiles

    #     # Real Supabase implementation would normally be here
    #     return []

    # def get_profile(self, profile_id):
    #     """Get a specific profile by ID."""
    #     if self.use_mock:
    #         profile = next(
    #             (p for p in self.mock_profiles if p["id"] == profile_id), None
    #         )
    #         return profile

    #     # Real Supabase implementation would normally be here
    #     return None

    # def get_profile_by_user_id(self, user_id):
    #     """Get profile for a specific user."""
    #     if self.use_mock:
    #         profile = next(
    #             (p for p in self.mock_profiles if p["user_id"] == user_id), None
    #         )
    #         return profile

    #     # Real Supabase implementation would normally be here
    #     return None

    # # Matching methods
    # def get_matches(self, user_id):
    #     """Get all matches for a user."""
    #     if self.use_mock:
    #         matches = [m for m in self.mock_matches if m["user_id"] == user_id]
    #         return matches

    #     # Real Supabase implementation would normally be here
    #     return []

    # def get_match(self, match_id):
    #     """Get a specific match by ID."""
    #     if self.use_mock:
    #         match = next((m for m in self.mock_matches if m["id"] == match_id), None)
    #         return match

    #     # Real Supabase implementation would normally be here
    #     return None

    # def store_match(self, user_id, match_user_id, score, explanation):
    #     """Store a match in the database."""
    #     match_data = {
    #         "id": len(self.mock_matches) + 1,
    #         "user_id": user_id,
    #         "matched_user_id": match_user_id,
    #         "compatibility_score": score,
    #         "explanation": explanation,
    #         "status": "pending",
    #         "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
    #     }

    #     if self.use_mock:
    #         # Check if a match already exists
    #         existing_match = next(
    #             (
    #                 m
    #                 for m in self.mock_matches
    #                 if m["user_id"] == user_id and m["matched_user_id"] == match_user_id
    #             ),
    #             None,
    #         )
    #         if existing_match:
    #             existing_match.update(match_data)
    #             return existing_match

    #         # Add new match
    #         self.mock_matches.append(match_data)
    #         return match_data

    #     # Real Supabase implementation would normally be here
    #     return None

    # def get_recommended_matches(self, user_id):
    #     """
    #     Get recommended matches for a user.
    #     In a real implementation, this would call the matching service.
    #     """
    #     # This will be replaced by the actual matching service
    #     all_users = self.get_users()
    #     existing_matches = self.get_matches(user_id)

    #     # Get IDs of already matched users
    #     matched_ids = [match["matched_user_id"] for match in existing_matches]

    #     # Filter out already matched users and the user themselves
    #     recommended = [
    #         user
    #         for user in all_users
    #         if user["id"] != user_id and user["id"] not in matched_ids
    #     ]

    #     # Add a fake compatibility score for demo purposes
    #     for user in recommended:
    #         user["compatibility_score"] = round(random.uniform(0.7, 1.0), 2)

    #     # Sort by compatibility score
    #     recommended.sort(key=lambda x: x["compatibility_score"], reverse=True)

    #     return recommended[:10]  # Return top 10 matches

    # def update_match_status(self, match_id, status):
    #     """Update a match status."""
    #     if self.use_mock:
    #         match = next((m for m in self.mock_matches if m["id"] == match_id), None)
    #         if match:
    #             match["status"] = status
    #             return match
    #         return None

    #     # Real Supabase implementation would normally be here
    #     return None


# Initialize service
def get_supabase_service():
    """Get an instance of the Supabase service."""
    return SupabaseService(config=get_config())
