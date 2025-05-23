import os
from supabase import create_client, Client
from flask import current_app
from datetime import datetime, timezone
import uuid
from typing import List
from .models import CreateChat

supabase_client = None


def init_supabase(app):
    """Initialize the Supabase client."""
    global supabase_client
    url = app.config.get("SUPABASE_URL")
    key = app.config.get("SUPABASE_KEY")

    if not url or not key:
        app.logger.error("Supabase URL or key is missing")
        raise ValueError("Supabase URL or key is missing")

    try:
        app.logger.info(f"Initializing Supabase client with URL: {url[:20]}...")
        supabase_client = create_client(url, key)
        app.logger.info("Supabase client initialized successfully")
    except Exception as e:
        app.logger.error(f"Error initializing Supabase client: {str(e)}")
        raise


class SupabaseService:
    """Service for interacting with Supabase."""

    @staticmethod
    def get_client():
        """Get the Supabase client instance."""
        if supabase_client is None:
            current_app.logger.error("Supabase client is not initialized")
            raise RuntimeError("Supabase client is not initialized")
        return supabase_client

    # User methods
    @staticmethod
    def get_users():
        """Get all users from Supabase with complete profile data for matching."""
        try:
            current_app.logger.info("Retrieving all users from Supabase")
            response = SupabaseService.get_client().table("users").select("*").execute()
            current_app.logger.info(f"Retrieved {len(response.data)} users")
            return response.data
        except Exception as e:
            current_app.logger.error(f"Error retrieving users: {str(e)}")
            raise

    @staticmethod
    def get_user(user_id):
        """Get a specific user by ID with complete profile for matching."""
        try:
            current_app.logger.info(f"Retrieving user with ID: {user_id}")
            response = (
                SupabaseService.get_client()
                .table("users")
                .select("*")
                .eq("id", user_id)
                .single()
                .execute()
            )
            if response.data:
                current_app.logger.info(f"User found: {user_id}")
            else:
                current_app.logger.warning(f"User not found: {user_id}")
            return response.data
        except Exception as e:
            current_app.logger.error(f"Error retrieving user {user_id}: {str(e)}")
            raise

    @staticmethod
    def get_user_by_email(email):
        """Get a user by email."""
        try:
            current_app.logger.info(f"Retrieving user with email: {email}")
            response = (
                SupabaseService.get_client()
                .table("users")
                .select("*")
                .eq("email", email)
                .single()
                .execute()
            )
            if response.data:
                current_app.logger.info(f"User found for email: {email}")
            else:
                current_app.logger.warning(f"User not found for email: {email}")
            return response.data
        except Exception as e:
            current_app.logger.error(
                f"Error retrieving user by email {email}: {str(e)}"
            )
            raise

    # Profile methods
    @staticmethod
    def get_profiles():
        """Get all profiles from Supabase."""
        try:
            current_app.logger.info("Retrieving all profiles from Supabase")
            response = (
                SupabaseService.get_client().table("profiles").select("*").execute()
            )
            current_app.logger.info(f"Retrieved {len(response.data)} profiles")
            return response.data
        except Exception as e:
            current_app.logger.error(f"Error retrieving profiles: {str(e)}")
            raise

    @staticmethod
    def get_profile(profile_id):
        """Get a specific profile by ID."""
        try:
            current_app.logger.info(f"Retrieving profile with ID: {profile_id}")
            response = (
                SupabaseService.get_client()
                .table("profiles")
                .select("*")
                .eq("id", profile_id)
                .single()
                .execute()
            )
            if response.data:
                current_app.logger.info(f"Profile found: {profile_id}")
            else:
                current_app.logger.warning(f"Profile not found: {profile_id}")
            return response.data
        except Exception as e:
            current_app.logger.error(f"Error retrieving profile {profile_id}: {str(e)}")
            raise

    @staticmethod
    def get_profile_by_user_id(user_id):
        """Get profile for a specific user."""
        try:
            current_app.logger.info(f"Retrieving profile for user ID: {user_id}")
            # First try looking up by user_id field
            try:
                response = (
                    SupabaseService.get_client()
                    .table("profiles")
                    .select("*")
                    .eq("id", user_id)
                    .single()
                    .execute()
                )
                if response.data:
                    current_app.logger.info(f"Profile found for user_id: {user_id}")
                    return response.data
            except Exception as e:
                current_app.logger.warning(
                    f"Error retrieving profile by user_id field: {str(e)}"
                )

            # Then try looking up by id field (in case user_id is stored as id)
            try:
                response = (
                    SupabaseService.get_client()
                    .table("profiles")
                    .select("*")
                    .eq("id", user_id)
                    .single()
                    .execute()
                )
                if response.data:
                    current_app.logger.info(f"Profile found with id: {user_id}")
                    return response.data
            except Exception as e:
                current_app.logger.warning(
                    f"Error retrieving profile by id field: {str(e)}"
                )

            current_app.logger.warning(f"No profile found for user: {user_id}")
            return None
        except Exception as e:
            current_app.logger.error(
                f"Error retrieving profile for user {user_id}: {str(e)}"
            )
            return None

    @staticmethod
    def create_profile(profile_data):
        """Create a new profile."""
        try:
            current_app.logger.info(
                f"Creating profile for user: {profile_data.get('user_id', profile_data.get('id'))}"
            )

            # Make sure both id and user_id are set
            user_id = profile_data.get("user_id", profile_data.get("id"))
            if not user_id:
                raise ValueError(
                    "Either user_id or id must be provided in profile_data"
                )

            profile_data["user_id"] = user_id
            profile_data["id"] = user_id

            # Check if the user exists in the users table
            try:
                user_exists = False
                try:
                    user_response = (
                        SupabaseService.get_client()
                        .table("users")
                        .select("id")
                        .eq("id", user_id)
                        .execute()
                    )
                    if user_response.data and len(user_response.data) > 0:
                        user_exists = True
                        current_app.logger.info(f"User {user_id} found in users table")
                    else:
                        current_app.logger.warning(
                            f"User {user_id} not found in users table"
                        )
                except Exception as e:
                    current_app.logger.warning(
                        f"Error checking if user exists in users table: {str(e)}"
                    )

                # If user doesn't exist in users table, create a record first
                if not user_exists:
                    current_app.logger.info(
                        f"User {user_id} not found in users table. Creating a user record."
                    )
                    user_data = {
                        "id": user_id,
                        "email": profile_data.get("email", f"{user_id}@example.com"),
                        "raw_user_meta_data": {
                            "name": profile_data.get("name", "User")
                        },
                    }

                    try:
                        # Insert the user first
                        user_insert = (
                            SupabaseService.get_client()
                            .table("users")
                            .insert(user_data)
                            .execute()
                        )
                        if user_insert.data and len(user_insert.data) > 0:
                            current_app.logger.info(f"Created user record: {user_id}")
                            user_exists = True
                        else:
                            current_app.logger.warning(
                                f"Failed to create user record for: {user_id}"
                            )
                    except Exception as ue:
                        current_app.logger.warning(
                            f"Error creating user record: {str(ue)}"
                        )

                # Only proceed with profile creation if the user exists
                if user_exists:
                    # First check if profile already exists
                    existing_profile = None
                    try:
                        existing_profile_response = (
                            SupabaseService.get_client()
                            .table("profiles")
                            .select("*")
                            .eq("user_id", user_id)
                            .execute()
                        )
                        if (
                            existing_profile_response.data
                            and len(existing_profile_response.data) > 0
                        ):
                            existing_profile = existing_profile_response.data[0]
                            current_app.logger.info(
                                f"Profile already exists for user: {user_id}"
                            )
                    except Exception as e:
                        current_app.logger.warning(
                            f"Error checking for existing profile: {str(e)}"
                        )

                    if existing_profile:
                        # Update existing profile
                        response = (
                            SupabaseService.get_client()
                            .table("profiles")
                            .update(profile_data)
                            .eq("id", existing_profile["id"])
                            .execute()
                        )
                        if response.data and len(response.data) > 0:
                            current_app.logger.info(
                                f"Updated existing profile for user: {user_id}"
                            )
                            return response.data[0]
                        else:
                            current_app.logger.warning(
                                f"Failed to update existing profile for user: {user_id}"
                            )
                            return None
                    else:
                        # Create new profile
                        response = (
                            SupabaseService.get_client()
                            .table("profiles")
                            .insert(profile_data)
                            .execute()
                        )
                        if response.data and len(response.data) > 0:
                            current_app.logger.info(
                                f"Created new profile for user: {user_id}"
                            )
                            return response.data[0]
                        else:
                            current_app.logger.warning(
                                f"No data returned after profile creation for user: {user_id}"
                            )
                            return None
                else:
                    current_app.logger.error(
                        f"Cannot create profile without a valid user in the users table: {user_id}"
                    )
                    return None
            except Exception as e:
                current_app.logger.error(
                    f"Error checking/creating user record: {str(e)}"
                )
                return None
        except Exception as e:
            current_app.logger.error(f"Error creating profile: {str(e)}")
            return None

    @staticmethod
    def update_profile(profile_id, profile_data):
        """Update an existing profile."""
        try:
            # Check if all required fields are present for a complete profile
            required_fields = [
                "name",
                "bio",
                "location",
                "industry",
                "skills",
                "interests",
                "collab_style",
                "startup_stage",
                "time_commitment",
                "availability",
            ]

            # Check if all required fields have values
            is_complete = True
            for field in required_fields:
                if field not in profile_data or not profile_data[field]:
                    is_complete = False
                    break

            # For array fields, check if they're non-empty
            array_fields = ["skills", "interests"]
            for field in array_fields:
                if field in profile_data and (
                    not profile_data[field] or len(profile_data[field]) == 0
                ):
                    is_complete = False
                    break

            # Set the completeness flag and updated timestamp
            profile_data["is_complete"] = is_complete
            profile_data["updated_at"] = datetime.now().isoformat()

            response = (
                SupabaseService.get_client()
                .table("profiles")
                .update(profile_data)
                .eq("id", profile_id)
                .execute()
            )
            current_app.logger.info(
                f"Updated profile {profile_id} (is_complete: {is_complete})"
            )
            return response.data[0] if response.data else None
        except Exception as e:
            current_app.logger.error(f"Error updating profile {profile_id}: {str(e)}")
            raise

    @staticmethod
    def delete_profile(profile_id):
        """Delete a profile."""
        try:
            response = (
                SupabaseService.get_client()
                .table("profiles")
                .delete()
                .eq("id", profile_id)
                .execute()
            )
            current_app.logger.info(f"Deleted profile {profile_id}")
            return len(response.data) > 0
        except Exception as e:
            current_app.logger.error(f"Error deleting profile {profile_id}: {str(e)}")
            raise

    # Matching methods
    @staticmethod
    def get_matches(user_id):
        """Get all matches for a user."""
        try:
            current_app.logger.info(f"Retrieving matches for user: {user_id}")
            # Get matches where the user is the initiator
            response1 = (
                SupabaseService.get_client()
                .table("matches")
                .select("*")
                .eq("user_id", user_id)
                .execute()
            )
            matches = response1.data if response1.data else []

            # Get matches where the user is the matched user
            response2 = (
                SupabaseService.get_client()
                .table("matches")
                .select("*")
                .eq("matched_user_id", user_id)
                .execute()
            )
            if response2.data:
                matches.extend(response2.data)

            current_app.logger.info(
                f"Retrieved {len(matches)} matches for user {user_id}"
            )
            return matches
        except Exception as e:
            current_app.logger.error(
                f"Error retrieving matches for user {user_id}: {str(e)}"
            )
            return []

    @staticmethod
    def get_match(match_id):
        """Get a specific match by ID."""
        try:
            current_app.logger.info(f"Getting match with ID: {match_id}")
            response = (
                SupabaseService.get_client()
                .table("matches")
                .select("*")
                .eq("id", match_id)
                .execute()
            )

            if response.data and len(response.data) > 0:
                current_app.logger.info(f"Found match with ID: {match_id}")
                return response.data[0]
            else:
                current_app.logger.warning(f"No match found with ID: {match_id}")
                return None
        except Exception as e:
            current_app.logger.error(f"Error retrieving match: {str(e)}")
            return None

    @staticmethod
    def store_match(user_id, match_user_id, score, explanation):
        """Store a match in the database."""
        try:
            current_app.logger.info(
                f"Storing match between {user_id} and {match_user_id}"
            )

            # First, check if this match already exists
            try:
                existing_match = (
                    SupabaseService.get_client()
                    .table("matches")
                    .select("*")
                    .eq("user_id", user_id)
                    .eq("matched_user_id", match_user_id)
                    .execute()
                )

                if existing_match.data and len(existing_match.data) > 0:
                    match_id = existing_match.data[0]["id"]
                    current_app.logger.info(
                        f"Match already exists between {user_id} and {match_user_id}, updating"
                    )

                    # Update the existing match with new score and explanation
                    match_data = {
                        "compatibility_score": score,
                        "explanation": explanation,
                        "updated_at": datetime.now().isoformat(),
                        # Reset rejected_at if it was previously rejected but now re-matched
                        "rejected_at": None,
                    }

                    update_response = (
                        SupabaseService.get_client()
                        .table("matches")
                        .update(match_data)
                        .eq("id", match_id)
                        .execute()
                    )
                    current_app.logger.info(
                        f"Updated match between {user_id} and {match_user_id}"
                    )

                    if update_response.data and len(update_response.data) > 0:
                        return update_response.data[0]
                    return None
            except Exception as e:
                current_app.logger.error(f"Error checking for existing match: {str(e)}")

            # If no existing match, create a new one
            match_id = str(uuid.uuid4())

            # Check if the reverse match exists (matched_user_id -> user_id)
            related_match_id = None
            try:
                reverse_match = (
                    SupabaseService.get_client()
                    .table("matches")
                    .select("id")
                    .eq("user_id", match_user_id)
                    .eq("matched_user_id", user_id)
                    .execute()
                )
                if reverse_match.data and len(reverse_match.data) > 0:
                    related_match_id = reverse_match.data[0]["id"]
                    current_app.logger.info(f"Found related match {related_match_id}")
            except Exception as e:
                current_app.logger.warning(
                    f"Error checking for reverse match: {str(e)}"
                )

            # Create the match record
            match_data = {
                "id": match_id,
                "user_id": user_id,
                "matched_user_id": match_user_id,
                "related_match_id": related_match_id,
                "compatibility_score": score,
                "explanation": explanation,
                "status": "pending",
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
            }

            response = (
                SupabaseService.get_client()
                .table("matches")
                .insert(match_data)
                .execute()
            )

            # If we found a related match, update it with this match's ID
            if related_match_id:
                try:
                    SupabaseService.get_client().table("matches").update(
                        {"related_match_id": match_id}
                    ).eq("id", related_match_id).execute()
                except Exception as e:
                    current_app.logger.warning(
                        f"Error updating related match: {str(e)}"
                    )

            current_app.logger.info(
                f"Created match between {user_id} and {match_user_id}"
            )
            return (
                response.data[0] if response.data and len(response.data) > 0 else None
            )
        except Exception as e:
            current_app.logger.error(f"Error storing match: {str(e)}")
            return None

    @staticmethod
    def get_recommended_matches(user_id):
        """Get recommended matches for a user, excluding previously rejected matches within 30 days."""
        try:
            current_app.logger.info(
                f"Retrieving recommended matches for user: {user_id}"
            )

            # First, get the user's profile to check if it's complete
            profile = SupabaseService.get_profile_by_user_id(user_id)
            if not profile:
                current_app.logger.warning(f"No profile found for user {user_id}")
                return []

            if not profile.get("is_complete", False):
                current_app.logger.warning(
                    f"Profile for user {user_id} is not complete"
                )
                return {
                    "error": "Your profile is not complete",
                    "message": "Please complete your profile to see matches",
                }

            # Get all matches for the user
            existing_matches = (
                SupabaseService.get_client()
                .table("matches")
                .select("*")
                .eq("user_id", user_id)
                .execute()
            )
            existing_matches_data = (
                existing_matches.data if existing_matches.data else []
            )

            # Get matches where user is the matched_user_id (other user initiated)
            other_matches = (
                SupabaseService.get_client()
                .table("matches")
                .select("*")
                .eq("matched_user_id", user_id)
                .execute()
            )
            other_matches_data = other_matches.data if other_matches.data else []

            # Combine all matches
            all_matches = existing_matches_data + other_matches_data

            # Extract the IDs of users already matched with
            matched_user_ids = set()
            for match in all_matches:
                # Exclude matches that were rejected more than 30 days ago
                if match.get("status") == "reject" and match.get("rejected_at"):
                    # Check if 30 days have passed since rejection
                    if SupabaseService._is_rejection_expired(match.get("rejected_at")):
                        continue

                if match.get("user_id") == user_id:
                    matched_user_ids.add(match.get("matched_user_id"))
                else:
                    matched_user_ids.add(match.get("user_id"))

            # Get all users
            users_response = (
                SupabaseService.get_client().table("users").select("*").execute()
            )
            all_users = users_response.data if users_response.data else []

            # Filter out users that already have matches with the current user
            potential_matches = []
            for u in all_users:
                if u.get("id") != user_id and u.get("id") not in matched_user_ids:
                    # Get the user's profile
                    other_profile = SupabaseService.get_profile_by_user_id(u.get("id"))
                    if other_profile and other_profile.get("is_complete", False):
                        # Only include users with complete profiles
                        potential_matches.append(
                            {
                                "id": u.get("id"),
                                "email": u.get("email"),
                                "profile": other_profile,
                            }
                        )

            current_app.logger.info(
                f"Found {len(potential_matches)} potential new matches for user {user_id}"
            )
            return potential_matches
        except Exception as e:
            current_app.logger.error(f"Error retrieving recommended matches: {str(e)}")
            return []

    @staticmethod
    def _is_rejection_expired(rejected_at_str):
        """Check if 30 days have passed since a match was rejected."""
        try:
            rejected_at = datetime.fromisoformat(rejected_at_str.replace("Z", "+00:00"))
            now = datetime.now()

            # Calculate difference in days
            delta = now - rejected_at
            return delta.days >= 30
        except Exception as e:
            current_app.logger.error(f"Error checking rejection expiry: {str(e)}")
            return False

    @staticmethod
    def update_match_status(match_id, status):
        """Update the status of a match."""
        try:
            # First get the match to check if we need to update related match
            match = SupabaseService.get_match(match_id)
            if not match:
                current_app.logger.error(f"Match {match_id} not found")
                return None

            # Prepare update data
            update_data = {"status": status, "updated_at": datetime.now().isoformat()}

            # If rejecting, set the rejected_at timestamp
            if status == "reject":
                update_data["rejected_at"] = datetime.now().isoformat()

            # If both users accept, create a conversation
            if status == "accept" and match.get("related_match_id"):
                related_match = SupabaseService.get_match(match["related_match_id"])
                if related_match and related_match.get("status") == "accept":
                    # Both users have accepted - change status to 'connected'
                    update_data["status"] = "connected"

                    # Create a conversation between the users
                    conversation_data = {
                        "id": str(uuid.uuid4()),
                        "user_id_1": match["user_id"],
                        "user_id_2": match["matched_user_id"],
                        "created_at": datetime.now().isoformat(),
                    }

                    try:
                        SupabaseService.create_conversation(conversation_data)
                        current_app.logger.info(
                            f"Created conversation for match {match_id}"
                        )

                        # Also update the related match to 'connected'
                        try:
                            SupabaseService.get_client().table("matches").update(
                                {
                                    "status": "connected",
                                    "updated_at": datetime.now().isoformat(),
                                }
                            ).eq("id", match["related_match_id"]).execute()
                        except Exception as e:
                            current_app.logger.error(
                                f"Error updating related match status: {str(e)}"
                            )
                    except Exception as e:
                        current_app.logger.error(
                            f"Error creating conversation: {str(e)}"
                        )

            # Update the match status
            response = (
                SupabaseService.get_client()
                .table("matches")
                .update(update_data)
                .eq("id", match_id)
                .execute()
            )
            current_app.logger.info(f"Updated match {match_id} status to {status}")
            return response.data[0] if response.data else None
        except Exception as e:
            current_app.logger.error(f"Error updating match status: {str(e)}")
            return None

    @classmethod
    def get_user_profile(cls, user_id):
        """Get a user's profile by user ID."""
        try:
            current_app.logger.info(f"Retrieving profile for user ID: {user_id}")
            client = cls.get_client()
            response = (
                client.table("profiles").select("*").eq("user_id", user_id).execute()
            )

            if response.data and len(response.data) > 0:
                current_app.logger.info(f"Profile found for user: {user_id}")
                return response.data[0]
            else:
                current_app.logger.warning(f"No profile found for user: {user_id}")
            return None
        except Exception as e:
            current_app.logger.error(f"Error getting user profile: {str(e)}")
            return None

    @classmethod
    def update_user_profile(cls, user_id, profile_data):
        """Update a user's profile."""
        try:
            current_app.logger.info(f"Updating profile for user ID: {user_id}")
            current_app.logger.debug(f"Profile data: {profile_data}")

            client = cls.get_client()

            # Check if profile exists
            existing_profile = cls.get_user_profile(user_id)

            if existing_profile:
                current_app.logger.info(
                    f"Updating existing profile for user: {user_id}"
                )
                try:
                    # In Supabase, the profile ID is stored in the 'id' field, not 'user_id'
                    response = (
                        client.table("profiles")
                        .update(profile_data)
                        .eq("id", user_id)
                        .execute()
                    )
                    current_app.logger.debug(f"Update response: {response}")
                    if response.data and len(response.data) > 0:
                        current_app.logger.info(
                            f"Profile updated successfully for user: {user_id}"
                        )
                        return response.data[0]
                    else:
                        current_app.logger.warning(
                            f"No data returned after profile update for user: {user_id}"
                        )
                        return None
                except Exception as e:
                    current_app.logger.error(
                        f"Error updating existing profile: {str(e)}"
                    )
                    raise
            else:
                current_app.logger.info(f"Creating new profile for user: {user_id}")

                # Make sure the profile data includes the ID
                if "id" not in profile_data:
                    profile_data["id"] = user_id

                try:
                    # For testing purposes, let's check if the user exists in users table
                    user_exists = True
                    try:
                        user_response = (
                            client.table("users")
                            .select("id")
                            .eq("id", user_id)
                            .execute()
                        )
                        if not user_response.data or len(user_response.data) == 0:
                            current_app.logger.warning(
                                f"User {user_id} not found in users table. Creating dummy user first."
                            )

                            # For our special test user, let's create a user record first
                            user_data = {
                                "id": user_id,
                                "email": profile_data.get(
                                    "email", "aniket17@testing.com"
                                ),
                                "name": profile_data.get("name", "Aniket Testing"),
                            }

                            try:
                                user_insert = (
                                    client.table("users").insert(user_data).execute()
                                )
                                current_app.logger.info(
                                    f"Created user record: {user_id}"
                                )
                                if user_insert.data and len(user_insert.data) > 0:
                                    user_exists = True
                                else:
                                    current_app.logger.warning(
                                        "Failed to create user record"
                                    )
                            except Exception as ue:
                                current_app.logger.error(
                                    f"Error creating user record: {str(ue)}"
                                )
                                # Continue anyway - the profile creation might work even if user doesn't exist
                    except Exception as ue:
                        current_app.logger.error(
                            f"Error checking if user exists: {str(ue)}"
                        )

                    # Insert the profile
                    response = client.table("profiles").insert(profile_data).execute()
                    current_app.logger.debug(f"Insert response: {response}")

                    if response.data and len(response.data) > 0:
                        current_app.logger.info(
                            f"Profile created successfully for user: {user_id}"
                        )
                        return response.data[0]
                    else:
                        current_app.logger.warning(
                            f"No data returned after profile creation for user: {user_id}"
                        )
                        return None
                except Exception as e:
                    current_app.logger.error(f"Error creating new profile: {str(e)}")
                    raise

        except Exception as e:
            current_app.logger.error(f"Error updating user profile: {str(e)}")
            raise

    @classmethod
    def get_user_match_history(cls, user_id):
        """Get a user's match history."""
        try:
            client = cls.get_client()

            # Get matches where the user is either the initiator or the matched user
            # Use filters and or instead of or_
            response = (
                client.table("matches")
                .select("*")
                .filter("user_id", "eq", user_id)
                .execute()
            )

            # Also get matches where user is the matched user
            response2 = (
                client.table("matches")
                .select("*")
                .filter("matched_user_id", "eq", user_id)
                .execute()
            )

            # Combine the results
            matches = (
                response.data + response2.data
                if response.data and response2.data
                else []
            )
            matches = response.data if response.data and not response2.data else matches
            matches = (
                response2.data if not response.data and response2.data else matches
            )

            return matches
        except Exception as e:
            current_app.logger.error(f"Error getting user match history: {str(e)}")
            return []

    # Chat methods
    @classmethod
    def get_conversations(cls, user_id):
        """Get all conversations where user is a participant."""
        try:
            current_app.logger.info(f"Retrieving conversations for user: {user_id}")
            client = cls.get_client()

            # Get conversations where user is the first participant
            response1 = (
                client.table("conversations")
                .select("*")
                .filter("user_id_1", "eq", user_id)
                .execute()
            )

            # Get conversations where user is the second participant
            response2 = (
                client.table("conversations")
                .select("*")
                .filter("user_id_2", "eq", user_id)
                .execute()
            )

            # Combine the results
            conversations = []
            if response1.data:
                conversations.extend(response1.data)
            if response2.data:
                conversations.extend(response2.data)

            current_app.logger.info(
                f"Retrieved {len(conversations)} conversations for user: {user_id}"
            )
            return conversations
        except Exception as e:
            current_app.logger.error(f"Error retrieving conversations: {str(e)}")
            # Create the conversations table if it doesn't exist
            if 'relation "conversations" does not exist' in str(e):
                current_app.logger.info(
                    "Conversations table does not exist, returning empty list"
                )
                return []
            raise

    @classmethod
    def find_conversation(cls, user_id_1, user_id_2):
        """Find a conversation between two users."""
        try:
            current_app.logger.info(
                f"Finding conversation between users: {user_id_1} and {user_id_2}"
            )
            client = cls.get_client()

            # Check first arrangement (user1 is first, user2 is second)
            response1 = (
                client.table("conversations")
                .select("*")
                .filter("user_id_1", "eq", user_id_1)
                .filter("user_id_2", "eq", user_id_2)
                .execute()
            )

            # If found, return it
            if response1.data and len(response1.data) > 0:
                current_app.logger.info(
                    f"Found conversation between users: {user_id_1} and {user_id_2}"
                )
                return response1.data[0]

            # Check second arrangement (user2 is first, user1 is second)
            response2 = (
                client.table("conversations")
                .select("*")
                .filter("user_id_1", "eq", user_id_2)
                .filter("user_id_2", "eq", user_id_1)
                .execute()
            )

            if response2.data and len(response2.data) > 0:
                current_app.logger.info(
                    f"Found conversation between users: {user_id_1} and {user_id_2}"
                )
                return response2.data[0]

            current_app.logger.info(
                f"No conversation found between users: {user_id_1} and {user_id_2}"
            )
            return None
        except Exception as e:
            current_app.logger.error(f"Error finding conversation: {str(e)}")
            # Handle case where table doesn't exist
            if 'relation "conversations" does not exist' in str(e):
                current_app.logger.info(
                    "Conversations table does not exist, returning None"
                )
                return None
            return None

    @classmethod
    def get_conversation(cls, conversation_id):
        """Get a specific conversation by ID."""
        try:
            current_app.logger.info(f"Retrieving conversation: {conversation_id}")
            client = cls.get_client()

            response = (
                client.table("conversations")
                .select("*")
                .eq("id", conversation_id)
                .single()
                .execute()
            )

            if response.data:
                current_app.logger.info(f"Retrieved conversation: {conversation_id}")
                return response.data
            current_app.logger.warning(f"Conversation not found: {conversation_id}")
            return None
        except Exception as e:
            current_app.logger.error(f"Error retrieving conversation: {str(e)}")
            return None

    @classmethod
    def create_conversation(cls, conversation_data):
        """Create a new conversation."""
        try:
            current_app.logger.info(
                f"Creating conversation between: {conversation_data['user_id_1']} and {conversation_data['user_id_2']}"
            )
            client = cls.get_client()

            # Try to create the conversations table if it doesn't exist
            try:
                client.table("conversations").select("count").limit(1).execute()
            except Exception as table_e:
                if 'relation "conversations" does not exist' in str(table_e):
                    current_app.logger.warning(
                        "Conversations table does not exist. Creating it..."
                    )
                    # In production, we'd use proper SQL migration
                    # For this demo, we'll just handle the error gracefully
                    sql = """
                    CREATE TABLE IF NOT EXISTS conversations (
                        id UUID PRIMARY KEY,
                        user_id_1 UUID NOT NULL,
                        user_id_2 UUID NOT NULL,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );
                    """
                    # Execute SQL is typically handled through migrations
                    # We'll just continue with the insert and let it fail if necessary

            response = client.table("conversations").insert(conversation_data).execute()

            if response.data and len(response.data) > 0:
                current_app.logger.info(
                    f"Created conversation: {conversation_data['id']}"
                )
                return response.data[0]
            current_app.logger.warning("No data returned after conversation creation")
            return None
        except Exception as e:
            current_app.logger.error(f"Error creating conversation: {str(e)}")
            if "permission denied" in str(e).lower():
                current_app.logger.error(
                    "Permission denied. SQL permissions are required on the Supabase project."
                )
            return None

    @classmethod
    def get_messages(cls, conversation_id):
        """Get messages for a specific conversation."""
        try:
            current_app.logger.info(
                f"Retrieving messages for conversation: {conversation_id}"
            )
            client = cls.get_client()

            response = (
                client.table("conversation_messages")
                .select("*")
                .eq("conversation_id", conversation_id)
                .order("created_at", desc=False)
                .execute()
            )

            current_app.logger.info(
                f"Retrieved {len(response.data)} messages for conversation: {conversation_id}"
            )
            return response.data
        except Exception as e:
            current_app.logger.error(f"Error retrieving messages: {str(e)}")
            # Handle case where table doesn't exist
            if 'relation "conversation_messages" does not exist' in str(e):
                current_app.logger.info(
                    "Conversation_messages table does not exist, returning empty list"
                )
                return []
            return []

    @classmethod
    def get_latest_message(cls, conversation_id):
        """Get the latest message in a conversation."""
        try:
            current_app.logger.info(
                f"Retrieving latest message for conversation: {conversation_id}"
            )
            client = cls.get_client()

            response = (
                client.table("conversation_messages")
                .select("*")
                .eq("conversation_id", conversation_id)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )

            if response.data and len(response.data) > 0:
                current_app.logger.info(
                    f"Retrieved latest message for conversation: {conversation_id}"
                )
                return response.data[0]
            current_app.logger.info(
                f"No messages found for conversation: {conversation_id}"
            )
            return None
        except Exception as e:
            current_app.logger.error(f"Error retrieving latest message: {str(e)}")
            return None

    @classmethod
    def create_message(cls, message_data):
        """Create a new message."""
        try:
            current_app.logger.info(
                f"Creating message in conversation: {message_data['conversation_id']}"
            )
            client = cls.get_client()

            # Try to create the conversation_messages table if it doesn't exist
            try:
                client.table("conversation_messages").select("count").limit(1).execute()
            except Exception as table_e:
                if 'relation "conversation_messages" does not exist' in str(table_e):
                    current_app.logger.warning(
                        "Conversation_messages table does not exist. Creating it..."
                    )
                    # In production, we'd use proper SQL migration
                    # For this demo, we'll just handle the error gracefully
                    sql = """
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
                    # Execute SQL is typically handled through migrations
                    # We'll just continue with the insert and let it fail if necessary

            response = (
                client.table("conversation_messages").insert(message_data).execute()
            )

            if response.data and len(response.data) > 0:
                current_app.logger.info(f"Created message: {message_data['id']}")
                return response.data[0]
            current_app.logger.warning("No data returned after message creation")
            return None
        except Exception as e:
            current_app.logger.error(f"Error creating message: {str(e)}")
            return None

    @classmethod
    def mark_messages_as_read(cls, conversation_id, user_id):
        """Mark messages as read for a user in a conversation."""
        try:
            current_app.logger.info(
                f"Marking messages as read for user: {user_id} in conversation: {conversation_id}"
            )
            client = cls.get_client()

            # Update messages where user is the receiver and messages are unread
            response = (
                client.table("conversation_messages")
                .update({"is_read": True})
                .eq("conversation_id", conversation_id)
                .eq("receiver_id", user_id)
                .eq("is_read", False)
                .execute()
            )

            current_app.logger.info(
                f"Marked {len(response.data) if response.data else 0} messages as read"
            )
            return True
        except Exception as e:
            current_app.logger.error(f"Error marking messages as read: {str(e)}")
            return False

    @classmethod
    def get_unread_count(cls, conversation_id, user_id):
        """Get count of unread messages for a user in a conversation."""
        try:
            current_app.logger.info(
                f"Getting unread count for user: {user_id} in conversation: {conversation_id}"
            )
            client = cls.get_client()

            # Count messages where user is the receiver and messages are unread
            response = (
                client.table("conversation_messages")
                .select("count")
                .eq("conversation_id", conversation_id)
                .eq("receiver_id", user_id)
                .eq("is_read", False)
                .execute()
            )

            if response.data and len(response.data) > 0:
                count = response.data[0]["count"]
                current_app.logger.info(f"Unread count: {count}")
                return count
            current_app.logger.info("No unread messages")
            return 0
        except Exception as e:
            current_app.logger.error(f"Error getting unread count: {str(e)}")
            return 0

    @staticmethod
    def ensure_profiles_table():
        """Ensure the profiles table exists with all required columns."""
        try:
            current_app.logger.info(
                "Ensuring profiles table exists with all required columns"
            )

            # Try direct approach - create a profile with all required fields
            # This will either work or fail with a helpful error message
            client = SupabaseService.get_client()

            # Create a dummy profile with all required fields
            dummy_profile = {
                "user_id": "00000000-0000-0000-0000-000000000000",  # Dummy user ID
                "name": "Schema Setup",
                "email": "schema@example.com",
                "bio": "Schema setup profile",
                "avatar_url": "https://example.com/avatar.png",
                "location": "Test Location",
                "industry": "Test Industry",
                "skills": [],
                "interests": [],
                "collab_style": "Test Style",
                "startup_stage": "Idea/Concept",
                "time_commitment": "Full-time",
                "availability": "Weekdays",
                "seeking_skills": [],
            }

            # Try to insert the dummy profile
            response = client.table("profiles").insert(dummy_profile).execute()

            # If successful, delete the dummy profile
            if response.data:
                dummy_id = response.data[0]["id"]
                client.table("profiles").delete().eq("id", dummy_id).execute()

            current_app.logger.info("Profiles table structure verified successfully")
            return {"message": "Profiles table structure verified successfully"}

        except Exception as e:
            current_app.logger.error(f"Error ensuring profiles table: {str(e)}")

            # If the error is about missing columns, extract the column name
            error_msg = str(e)
            if "Could not find the" in error_msg and "column" in error_msg:
                # Try to extract the column name from the error message
                import re

                match = re.search(r"Could not find the '(\w+)' column", error_msg)
                if match:
                    missing_column = match.group(1)
                    return {
                        "error": f"Missing column '{missing_column}' in profiles table",
                        "message": f"Please add the '{missing_column}' column to your profiles table in Supabase",
                    }

            return {
                "error": "Failed to verify profiles table structure",
                "message": f"Error: {str(e)}",
            }

    @staticmethod
    def update_match_reason(match_id, reason):
        """Update the rejection reason for a match."""
        try:
            current_app.logger.info(f"Updating match {match_id} rejection reason")

            # Check if the reason field exists in the database
            # If not, we'll need to first ensure it exists
            # This field might not be in all installations
            try:
                # First, check if the column exists
                client = SupabaseService.get_client()

                # Create rejection_reason column if it doesn't exist
                sql = """
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                                  WHERE table_name = 'matches' AND column_name = 'rejection_reason')
                    THEN
                        ALTER TABLE matches ADD COLUMN rejection_reason TEXT;
                    END IF;
                END
                $$;
                """

                # Execute the SQL (this might fail if user doesn't have permission)
                try:
                    client.rpc("exec_sql", {"sql": sql}).execute()
                    current_app.logger.info("Ensured rejection_reason column exists")
                except Exception as e:
                    current_app.logger.warning(
                        f"Failed to ensure column exists: {str(e)}"
                    )
                    # Continue anyway - column might already exist
            except Exception as e:
                current_app.logger.warning(f"Error checking column: {str(e)}")

            # Update the match with the rejection reason
            update_data = {
                "rejection_reason": reason,
                "updated_at": datetime.now().isoformat(),
            }

            response = (
                SupabaseService.get_client()
                .table("matches")
                .update(update_data)
                .eq("id", match_id)
                .execute()
            )

            if response.data and len(response.data) > 0:
                current_app.logger.info(f"Updated match {match_id} rejection reason")
                return response.data[0]
            else:
                current_app.logger.error(
                    f"Failed to update match {match_id} rejection reason"
                )
                return None
        except Exception as e:
            current_app.logger.error(f"Error updating match rejection reason: {str(e)}")
            return None

    @classmethod
    def _chat_exists(cls, member_ids: List[str]) -> int:
        try:
            client = cls.get_client()

            chat_ids = client.rpc(
                "find_chat_by_exact_members", {"_user_ids": member_ids}
            ).execute()

            # Return first matching chat
            if chat_ids.data:
                return chat_ids.data[0]["chat_id"]

            return None

        except Exception as e:
            current_app.logger.error(f"Error checking if chat exists: {str(e)}")
            return None

    @classmethod
    def create_chat(cls, create_chat: CreateChat):
        try:
            # Get client instance
            client = cls.get_client()

            # Return existing chat
            existing_chat_id = cls._chat_exists(create_chat.user_ids)
            if existing_chat_id:
                existing_chat_response = (
                    client.table("chats")
                    .select("*")
                    .eq("id", existing_chat_id)
                    .execute()
                )

                # If failed, return None
                if not existing_chat_response.data:
                    current_app.logger.error(f"No existing chat data returned")
                    return None

                return existing_chat_response.data[0]

            # Create new chat
            new_chat_response = (
                client.table("chats").insert(create_chat.dump_insert_chat()).execute()
            )

            # If failed, return None
            if not new_chat_response.data:
                current_app.logger.error(f"No new chat data returned")
                return None

            # Add members to new chat
            new_chat_row = new_chat_response.data[0]
            new_chat_id = new_chat_row["id"]
            client.table("chat_members").insert(
                create_chat.dump_insert_members(new_chat_id)
            ).execute()

            return new_chat_row

        except Exception as e:
            current_app.logger.error(f"Failed to create new chat: {str(e)}")
            return None

    @classmethod
    def create_ai_chat(cls, user_id: str):
        try:
            client = cls.get_client()
            ai_id = current_app.config.get("SUPABASE_AI_USER")
            user_ids = [user_id, ai_id]

            # Return existing chat
            existing_chat_id = cls._chat_exists(user_ids)
            if existing_chat_id:
                existing_chat_response = (
                    client.table("chats")
                    .select("*")
                    .eq("id", existing_chat_id)
                    .execute()
                )

                # If failed, return None
                if not existing_chat_response.data:
                    current_app.logger.error(f"No existing chat data returned")
                    return None

                return existing_chat_response.data[0]

            new_chat = [{"name": "VenturesBot", "is_group": False, "is_ai": True}]
            new_chat_response = client.table("chats").insert(new_chat).execute()

            if not new_chat_response.data:
                current_app.logger.error(f"No new chat data returned")
                return None

            new_chat_row = new_chat_response.data[0]
            new_chat_id = new_chat_row["id"]
            inserts = [
                {"user_id": user_id, "chat_id": new_chat_id},
                {"user_id": ai_id, "chat_id": new_chat_id},
            ]
            client.table("chat_members").insert(inserts).execute()

            return new_chat_row

        except Exception as e:
            current_app.logger.error(f"Failed to create new AI chat: {str(e)}")
            return None

    @classmethod
    def send_ai_message(cls, message: str, chat_id: int):
        try:
            client = cls.get_client()

            sent_at = datetime.now(timezone.utc).isoformat()
            ai_id = current_app.config.get("SUPABASE_AI_USER")

            message_insert = [
                {
                    "chat_id": chat_id,
                    "sent_at": sent_at,
                    "content": message,
                    "user_id": ai_id,
                }
            ]

            message_response = client.table("messages").insert(message_insert).execute()
            message_data = message_response.data

            if not message_data:
                current_app.logger.error(f"No new chat data returned")
                return None

            chat_response = (
                client.table("chats")
                .update({"last_message_id": message_data[0]["id"]})
                .eq("id", chat_id)
                .execute()
            )
            chat_data = chat_response.data

            if not chat_data:
                current_app.logger.error(f"No chat update data returned")
                return None

        except Exception as e:
            current_app.logger.error(f"Failed to send AI chat message: {str(e)}")
            return None
