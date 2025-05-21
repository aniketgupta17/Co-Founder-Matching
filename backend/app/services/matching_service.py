import itertools
from collections import defaultdict
from flask import current_app
from .supabase_service import SupabaseService

# Imported weights and mappings from complete_matchmaking.py
WEIGHTS = {
    "skill_overlap": 2.0,
    "complementary_skills": 1.5,
    "interest_overlap": 1.5,
    "goal_alignment": 2.0,
    "stage_alignment": 2.0,
    "location_synergy": 1.0,
    "availability_synergy": 0.5,
    "collab_style_synergy": 1.0
}

# Numeric mapping for startup stages (the closer, the more aligned)
STAGE_MAPPING = {
    "Idea/Concept": 1,
    "Prototype": 2,
    "Research/Academic": 2,
    "Early Clinical Trials": 3,
    "Seed Funded": 4,
    "Series A+": 5,
}

# Numeric mapping for user goals (the closer, the more aligned)
GOAL_MAPPING = {
    "Build MVP": 1,
    "Recruit team": 1,
    "Find CTO": 1,
    "Join accelerator": 2,
    "Get funded": 3,
    "Launch product": 3,
    "Scale internationally": 4,
    "Expand research lab": 4
}

# Complementary synergy among skills. synergy > 0 => beneficial pairing
COMPLEMENT_MATRIX = {
    "Python": { "AI": 1.2, "DataScience": 1.3, "Node.js": 0.7 },
    "AI": { "Python": 1.2, "DataScience": 1.5 },
    "DataScience": { "Python": 1.3, "AI": 1.5 },
    "JavaScript": { "React": 1.2, "Node.js": 1.3, "Design": 0.8 },
    "React": { "JavaScript": 1.2, "Design": 1.0 },
    "Node.js": { "JavaScript": 1.3, "Python": 0.7 },
    "Marketing": { "Design": 1.0, "Business Development": 1.2 },
    "Design": { "Marketing": 1.0, "JavaScript": 0.8, "React": 1.0 },
    "Business Development": { "Marketing": 1.2, "Finance": 1.0 },
    "Finance": { "Business Development": 1.0 },
    "CivilEngineering": { "MechanicalEngineering": 1.5 },
    "MechanicalEngineering": { "CivilEngineering": 1.5 },
    "Medicine": { "Biology": 1.5, "Pharmacy": 1.0 },
    "Biology": { "Medicine": 1.5, "Pharmacy": 1.0 },
    "Pharmacy": { "Medicine": 1.0, "Biology": 1.0 },
}

# Potential synergy or friction among collaboration styles
COLLAB_STYLE_SYNERGY = {
    ("Visionary", "Planner"): 1.0,
    ("Visionary", "Analytical"): 0.8,
    ("Planner", "Executor"): 1.0,
    ("Analytical", "Creative"): 0.8,
    ("Connector", "Visionary"): 0.7,
    ("Analytical", "Analytical"): 0.5,
    ("Creative", "Creative"): 0.5,
    ("Executor", "Executor"): 0.4,
}

class MatchingService:
    """Service for co-founder matching algorithm."""
    
    def generate_matches_for_user(self, user_id, top_n=10, exclude_user_ids=None):
        """Generate top matches for a specific user.
        
        Args:
            user_id: The user ID to generate matches for
            top_n: Maximum number of matches to return
            exclude_user_ids: Set of user IDs to exclude from matching (optional)
        """
        try:
            current_app.logger.info(f"Generating matches for user {user_id}")
            
            # Initialize exclude set if not provided
            if exclude_user_ids is None:
                exclude_user_ids = set()
            else:
                exclude_user_ids = set(exclude_user_ids)  # Ensure it's a set for O(1) lookups
            
            current_app.logger.info(f"Excluding {len(exclude_user_ids)} users from matching")
            
            # Get all users from Supabase
            all_users = SupabaseService.get_users()
            
            # Get the user profile we're matching for
            target_user_profile = SupabaseService.get_profile_by_user_id(user_id)
            if not target_user_profile:
                current_app.logger.warning(f"No profile found for user {user_id}")
                return []
            
            # Get all profiles
            all_profiles = SupabaseService.get_profiles()
            
            # Create a map of user_id to profile for quick lookup
            profile_map = {profile.get('user_id', profile.get('id')): profile for profile in all_profiles if profile.get('user_id') or profile.get('id')}
            
            # Get existing matches to avoid recommending already matched users
            existing_matches = SupabaseService.get_user_match_history(user_id)
            matched_user_ids = set()
            for match in existing_matches:
                if match['user_id'] == user_id:
                    matched_user_ids.add(match['matched_user_id'])
                else:
                    matched_user_ids.add(match['user_id'])
            
            # Add manually excluded users to the set of users to exclude
            exclude_user_ids = exclude_user_ids.union(matched_user_ids)
            
            # Filter out the target user and excluded users from potential matches,
            # and only include users with complete profiles
            potential_matches = []
            for user in all_users:
                other_id = user.get('id')
                if (other_id != user_id and 
                    other_id not in exclude_user_ids):
                    other_profile = profile_map.get(other_id)
                    if other_profile and other_profile.get('is_complete', False):
                        potential_matches.append((user, other_profile))
            
            current_app.logger.info(f"Found {len(potential_matches)} potential matches for user {user_id}")
            
            # Compute match scores for all potential matches
            match_results = []
            
            for other_user, other_profile in potential_matches:
                subs = self._compute_subscores(target_user_profile, other_profile)
                score_val = self._weighted_score(subs)
                
                # Only consider matches with a minimum score
                if score_val >= 0.5:
                    # Generate explanation
                    explanation = self._generate_explanation(target_user_profile, other_profile, subs, score_val)
                    
                    # Combine user data with profile data
                    user_data = {
                        "id": other_user['id'],
                        "email": other_user.get('email'),
                        "name": other_profile.get('name'),
                        "profile": other_profile
                    }
                    
                    match_results.append({
                        "user_id": other_user['id'],
                        "compatibility_score": score_val,
                        "explanation": explanation,
                        **user_data
                    })
            
            # Sort by score (descending) and take top N
            match_results.sort(key=lambda x: x['compatibility_score'], reverse=True)
            top_matches = match_results[:top_n]
            
            current_app.logger.info(f"Generated {len(top_matches)} top matches for user {user_id}")
            return top_matches
        except Exception as e:
            current_app.logger.error(f"Error generating matches for user {user_id}: {str(e)}")
            return []

    def generate_matches_for_all_users(self, top_n=10):
        """Generate top matches for all users."""
        try:
            current_app.logger.info("Generating matches for all users")
            
            # Get all users and profiles
            users = SupabaseService.get_users()
            all_profiles = SupabaseService.get_profiles()
            
            # Create a map of user_id to profile for quick lookup
            profile_map = {profile.get('user_id', profile.get('id')): profile for profile in all_profiles if profile.get('user_id') or profile.get('id')}
            
            # We'll store results in recs_dict[user_id] = list of match infos
            recs_dict = defaultdict(list)
            
            # Count users with profiles
            users_with_profiles = [user for user in users if user['id'] in profile_map]
            current_app.logger.info(f"Found {len(users_with_profiles)} users with profiles out of {len(users)} total users")
            
            # Generate matches between all pairs of users with profiles
            for userA in users_with_profiles:
                uidA = userA['id']
                profileA = profile_map.get(uidA)
                
                if not profileA:
                    continue
                
                for userB in users_with_profiles:
                    uidB = userB['id']
                    
                    # Skip self-matches
                    if uidA == uidB:
                        continue
                    
                    profileB = profile_map.get(uidB)
                    if not profileB:
                        continue
                    
                    subs = self._compute_subscores(profileA, profileB)
                    score_val = self._weighted_score(subs)
                    
                    # Only consider matches with a minimum score
                    if score_val >= 0.5:
                        explanation = self._generate_explanation(profileA, profileB, subs, score_val)
                        
                        recs_dict[uidA].append({
                            "match_id": uidB,
                            "score": score_val,
                            "explanation": explanation
                        })
            
            # Now pick top N for each user
            output = {}
            for uid in recs_dict:
                # Sort descending
                sorted_list = sorted(recs_dict[uid], key=lambda x: x['score'], reverse=True)
                top_matches = sorted_list[:top_n]
                output[str(uid)] = top_matches
            
            current_app.logger.info(f"Generated matches for {len(output)} users")
            return output
        except Exception as e:
            current_app.logger.error(f"Error generating matches for all users: {str(e)}")
            return {}
    
    def _skill_overlap(self, userA, userB):
        """Return (count, shared_skills) for skill overlap."""
        setA = set(userA.get("skills", []))
        setB = set(userB.get("skills", []))
        shared = setA.intersection(setB)
        return (len(shared), shared)
    
    def _complementary_skill_synergy(self, userA, userB):
        """Sum synergy from complementary skill pairs + a list of synergy details."""
        synergy_sum = 0.0
        synergy_details = []
        for skillA in userA.get("skills", []):
            if skillA in COMPLEMENT_MATRIX:
                for skillB in userB.get("skills", []):
                    val = COMPLEMENT_MATRIX[skillA].get(skillB, 0.0)
                    if val > 0:
                        synergy_sum += val
                        synergy_details.append((skillA, skillB, val))
        return synergy_sum, synergy_details
    
    def _interest_overlap(self, userA, userB):
        """Return (count, shared_interests)."""
        setA = set(userA.get("interests", []))
        setB = set(userB.get("interests", []))
        shared = setA.intersection(setB)
        return (len(shared), shared)
    
    def _goal_alignment(self, userA, userB):
        """Return numeric sub-score (0..1) and descriptor."""
        gA = GOAL_MAPPING.get(userA.get("goals"), 0)
        gB = GOAL_MAPPING.get(userB.get("goals"), 0)
        if gA == 0 or gB == 0:
            return (0.0, "none")
        diff = abs(gA - gB)
        score = max(0, 1.0 - 0.3 * diff)
        if diff == 0:
            desc = "exact"
        elif score > 0:
            desc = "partial"
        else:
            desc = "none"
        return (score, desc)
    
    def _stage_alignment(self, userA, userB):
        """Return numeric sub-score (0..1) and descriptor."""
        sA = STAGE_MAPPING.get(userA.get("startup_stage"), 0)
        sB = STAGE_MAPPING.get(userB.get("startup_stage"), 0)
        if sA == 0 or sB == 0:
            return (0.0, "none")
        diff = abs(sA - sB)
        score = max(0, 1.0 - 0.3 * diff)
        if diff == 0:
            desc = "exact"
        elif score > 0:
            desc = "partial"
        else:
            desc = "none"
        return (score, desc)
    
    def _location_synergy(self, userA, userB):
        """Example synergy: +1 if they're in the same location, else 0."""
        locA = userA.get("location")
        locB = userB.get("location")
        if locA and locB and locA == locB:
            return 1.0
        return 0.0
    
    def _availability_synergy(self, userA, userB):
        """Example synergy: if they have the exact same availability => 0.5 synergy."""
        avaA = userA.get("availability", "")
        avaB = userB.get("availability", "")
        
        if not avaA or not avaB:
            return 0.0
        
        # If exactly the same
        if avaA == avaB:
            return 1.0
        
        # If one is "Student - flexible" and the other is anything else, let's say 0.5 synergy
        if "student" in avaA.lower() or "student" in avaB.lower():
            return 0.5
        
        return 0.0
    
    def _collab_style_synergy(self, userA, userB):
        """If both have 'collab_style', look up synergy in a matrix."""
        styleA = userA.get("collab_style")
        styleB = userB.get("collab_style")
        if not styleA or not styleB:
            return 0.0
        
        # Check direct tuple or reversed
        key1 = (styleA, styleB)
        key2 = (styleB, styleA)
        if key1 in COLLAB_STYLE_SYNERGY:
            return COLLAB_STYLE_SYNERGY[key1]
        elif key2 in COLLAB_STYLE_SYNERGY:
            return COLLAB_STYLE_SYNERGY[key2]
        return 0.0
    
    def _compute_subscores(self, userA, userB):
        """Compute each factor, return them in a dict for explanation & weighting."""
        # Skills
        so_count, so_shared = self._skill_overlap(userA, userB)
        cs_sum, cs_details = self._complementary_skill_synergy(userA, userB)
        
        # Interests
        io_count, io_shared = self._interest_overlap(userA, userB)
        
        # Goals
        ga_val, ga_desc = self._goal_alignment(userA, userB)
        
        # Stage
        st_val, st_desc = self._stage_alignment(userA, userB)
        
        # Location
        loc_val = self._location_synergy(userA, userB)
        
        # Availability
        ava_val = self._availability_synergy(userA, userB)
        
        # Collaboration style
        cstyle_val = self._collab_style_synergy(userA, userB)
        
        return {
            "skill_overlap_count": so_count,
            "shared_skills": list(so_shared),
            "complement_sum": cs_sum,
            "complement_details": cs_details,  # list of (skillA, skillB, synergyVal)
            "interest_overlap_count": io_count,
            "shared_interests": list(io_shared),
            "goal_val": ga_val,
            "goal_desc": ga_desc,
            "stage_val": st_val,
            "stage_desc": st_desc,
            "location_val": loc_val,
            "availability_val": ava_val,
            "collab_style_val": cstyle_val
        }
    
    def _weighted_score(self, subscores):
        """Combine the subscores with the global WEIGHTS to yield a final numeric match score."""
        score = (
            (subscores["skill_overlap_count"] * WEIGHTS["skill_overlap"])
          + (subscores["complement_sum"] * WEIGHTS["complementary_skills"])
          + (subscores["interest_overlap_count"] * WEIGHTS["interest_overlap"])
          + (subscores["goal_val"] * WEIGHTS["goal_alignment"])
          + (subscores["stage_val"] * WEIGHTS["stage_alignment"])
          + (subscores["location_val"] * WEIGHTS["location_synergy"])
          + (subscores["availability_val"] * WEIGHTS["availability_synergy"])
          + (subscores["collab_style_val"] * WEIGHTS["collab_style_synergy"])
        )
        return round(score, 3)
    
    def _generate_explanation(self, userA, userB, subscores, final_score):
        """Return a detailed explanation referencing all match factors."""
        # Extract
        so_count = subscores["skill_overlap_count"]
        so_shared = subscores["shared_skills"]
        cs_sum = subscores["complement_sum"]
        cs_details = subscores["complement_details"]
        io_count = subscores["interest_overlap_count"]
        io_shared = subscores["shared_interests"]
        goal_val = subscores["goal_val"]
        goal_desc = subscores["goal_desc"]
        stage_val = subscores["stage_val"]
        stage_desc = subscores["stage_desc"]
        loc_val = subscores["location_val"]
        ava_val = subscores["availability_val"]
        cstyle_val = subscores["collab_style_val"]
        
        # Build bullet points or lines:
        lines = []
        
        # Skills Overlap
        if so_count > 0:
            lines.append(
                f"You share {so_count} skill{'s' if so_count>1 else ''}: {', '.join(so_shared)}."
            )
        
        # Complementary Skills
        if cs_sum > 0:
            # Pick top 3 complementary pairs
            top_pairs = sorted(cs_details, key=lambda x: x[2], reverse=True)[:3]
            pairs_text = ", ".join([f"{a} + {b}" for a, b, _ in top_pairs])
            lines.append(f"You have complementary skills: {pairs_text}.")
        
        # Interests Overlap
        if io_count > 0:
            lines.append(
                f"You share {io_count} interest{'s' if io_count>1 else ''}: {', '.join(io_shared)}."
            )
        
        # Goals
        if goal_desc != "none":
            if goal_desc == "exact":
                lines.append("You have exactly the same startup goals.")
            else:
                lines.append("Your startup goals are well-aligned.")
        
        # Stage
        if stage_desc != "none":
            if stage_desc == "exact":
                lines.append("You're at the same startup stage.")
            else:
                lines.append("You're at compatible startup stages.")
        
        # Location
        if loc_val > 0:
            lines.append(f"You're both located in {userA.get('location')}.")
        
        # Availability
        if ava_val > 0:
            if ava_val == 1.0:
                lines.append("You have the same availability.")
            else:
                lines.append("Your availability schedules are compatible.")
        
        # Collab Style
        if cstyle_val > 0:
            lines.append(f"Your collaboration styles ({userA.get('collab_style')} and {userB.get('collab_style')}) work well together.")
        
        # Final numeric mention
        lines.append(f"Overall match score: {final_score}.")
        
        # Combine into a single explanation
        explanation = " ".join(lines)
        return explanation


# Function to get a matching service instance
def get_matching_service():
    """Get an instance of the matching service."""
    return MatchingService()
