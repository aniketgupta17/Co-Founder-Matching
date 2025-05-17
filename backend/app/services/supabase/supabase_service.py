import logging
import os
from typing import Any, Dict, List, Optional

from app.core.config import Config, get_config

from flask import current_app
from supabase import create_client
from pydantic import BaseModel, model_validator, field_validator
import uuid
from datetime import datetime
from pydantic import TypeAdapter


class ChatMembers(BaseModel):
    id: str
    name: Optional[str] = "Default Name"
    avatar_url: Optional[str] = None

    class Config:
        extra = "ignore"
        arbitrary_types_allowed = True


class UserChatRPC(BaseModel):
    id: int
    is_group: bool
    created_at: datetime
    last_message: Optional[str] = None
    last_message_timestamp: Optional[datetime] = None
    name: Optional[str] = None
    members: List[ChatMembers]


class UserChat(BaseModel):
    id: int
    name: str
    last_message: str
    timestamp: datetime
    unread: bool
    avatar: Optional[str] = None


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

    def _process_chat(self, user_id: str, chat: UserChatRPC) -> UserChat | None:
        try:
            other_members = [
                member for member in chat.members if str(member.id) != user_id
            ]

            if not other_members:
                logging.warning("No other members in the chat")
                return

            # Update details for frontend
            name = chat.name or ", ".join(member.name for member in other_members)[:30]
            avatar = other_members[0].avatar_url

            # Return chat model
            return UserChat(
                id=chat.id,
                name=name,
                last_message=chat.last_message,
                timestamp=chat.last_message_timestamp,
                unread=True,
                avatar=avatar,
            )

        except Exception:
            logging.error(f"Could not process chat {chat.id}", exc_info=True)
            return None

    def _process_chats(self, user_id: str, response) -> List[dict]:
        adapter = TypeAdapter(List[UserChatRPC])
        rpc_chats = adapter.validate_python(response)

        user_chats = []
        for chat in rpc_chats:
            user_chat = self._process_chat(user_id=user_id, chat=chat)

            if user_chat:
                user_chats.append(user_chat.model_dump())

        return user_chats

    def get_user_group_chats(self, user_id: str) -> List[dict]:
        try:
            response = self.client.rpc(
                "get_user_group_chats", {"_user_id": user_id}
            ).execute()

            return self._process_chats(user_id=user_id, response=response)

        except Exception:
            logging.error("Error processing group chats", exc_info=True)
            raise

    def get_user_chats(self, user_id: str) -> List[dict]:
        logging.error(f"User ID: {user_id}")
        try:
            response = self.client.rpc(
                "get_user_chats", {"_user_id": user_id}
            ).execute()

            logging.error(response)

            return self._process_chats(user_id=user_id, response=response.data)

        except Exception:
            logging.error("Error processing private chats", exc_info=True)
            raise

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
