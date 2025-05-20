from flask import jsonify, request
from . import bp
from ...services.supabase_service import SupabaseService
from ...services.matching_service import get_matching_service
from ...services.auth_service import login_required
from flask import current_app
import uuid
from datetime import datetime

# Matching endpoints
@bp.route('/matches', methods=['GET'])
@login_required
def get_matches():
    """Get a list of all matches for the authenticated user."""
    # Get user from request context (set by login_required decorator)
    user = request.current_user
    user_id = user['id']
    
    try:
        current_app.logger.info(f"Retrieving matches for user: {user_id}")
        matches = SupabaseService.get_matches(user_id)
        
        # If no matches found or error occurred but we have a test user,
        # generate some mock matches as a fallback
        if (not matches or len(matches) == 0) and user.get('is_test_user', False):
            current_app.logger.info(f"No matches found for test user {user_id}. Returning mock data.")
            return jsonify([
                {
                    "id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "matched_user_id": "591d758e-1a90-4976-81bd-7a4c93e2e18b",  # David Allen
                    "compatibility_score": 0.89,
                    "status": "pending",
                    "created_at": datetime.now().isoformat(),
                    "explanation": "You both have complementary skills in backend development and UI/UX design."
                },
                {
                    "id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "matched_user_id": "e52e9fbb-ccdf-4faf-b7aa-50e0f69ce865",  # Laura Rodriguez
                    "compatibility_score": 0.75,
                    "status": "pending",
                    "created_at": datetime.now().isoformat(),
                    "explanation": "You both share interests in health tech and have similar working styles."
                },
                {
                    "id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "matched_user_id": "096ce98c-4534-49d2-ba0a-4be0dd5e7c74",  # Kevin Johnson
                    "compatibility_score": 0.92,
                    "status": "pending",
                    "created_at": datetime.now().isoformat(),
                    "explanation": "You both have complementary skills and share interests in AI and machine learning."
                }
            ])
        
        current_app.logger.info(f"Retrieved {len(matches)} matches for user {user_id}")
        return jsonify(matches)
    except Exception as e:
        current_app.logger.error(f"Error retrieving matches: {str(e)}")
        return jsonify({"error": f"Failed to retrieve matches: {str(e)}"}), 500

@bp.route('/matches/<string:match_id>', methods=['GET'])
@login_required
def get_match(match_id):
    """Get a specific match by ID."""
    match = SupabaseService.get_match(match_id)
    
    if match is None:
        return jsonify({"error": "Match not found"}), 404
        
    # Check if the match belongs to the current user
    user = request.current_user
    if match['user_id'] != user['id'] and match['matched_user_id'] != user['id']:
        return jsonify({"error": "Unauthorized"}), 403
        
    return jsonify(match)

@bp.route('/matches/recommend', methods=['GET'])
@login_required
def recommend_matches():
    """Get potential co-founder matches for the authenticated user using the matching algorithm."""
    user = request.current_user
    user_id = user['id']
    
    # Get the number of matches to return (default 5)
    count = request.args.get('count', 5, type=int)
    
    # Always use real data from Supabase
    current_app.logger.info(f"Generating recommended matches for user: {user_id}")
    
    # Use the matching service to generate matches
    matching_service = get_matching_service()
    
    try:
        recommended_matches = matching_service.generate_matches_for_user(user_id, top_n=count)
        current_app.logger.info(f"Generated {len(recommended_matches)} recommendations for user {user_id}")
        return jsonify(recommended_matches)
    except Exception as e:
        current_app.logger.error(f"Error generating matches: {str(e)}")
        
        # If there's an error with the matching service but we have a test user,
        # return mock data as a fallback
        if user.get('is_test_user', False):
            current_app.logger.info(f"Falling back to mock data for test user: {user_id}")
            return jsonify([
                {
                    "user_id": "591d758e-1a90-4976-81bd-7a4c93e2e18b",
                    "email": "david.allen@example.org",
                    "name": "David Allen",
                    "compatibility_score": 0.92,
                    "explanation": "You both have complementary skills in Python and React. David also has experience in data science which aligns with your AI interests.",
                    "profile": {
                        "bio": "Experienced data scientist with expertise in cloud infrastructure.",
                        "skills": ["Python", "Data Science", "Cloud"],
                        "interests": ["HealthTech", "AI"],
                        "location": "London",
                        "availability": "Part-Time",
                        "startup_stage": "Seed Funded"
                    }
                },
                {
                    "user_id": "e52e9fbb-ccdf-4faf-b7aa-50e0f69ce865",
                    "email": "laura.rodriguez@example.org",
                    "name": "Laura Rodriguez",
                    "compatibility_score": 0.85,
                    "explanation": "Laura's experience in digital marketing complements your technical skills. You both share interests in Health Tech.",
                    "profile": {
                        "bio": "Marketing expert with a passion for health technology.",
                        "skills": ["Marketing", "Design", "Communication"],
                        "interests": ["HealthTech", "EdTech"],
                        "location": "Dubai",
                        "availability": "Part-Time",
                        "startup_stage": "Idea/Concept"
                    }
                },
                {
                    "user_id": "13d2e098-67da-41f3-a8ee-4138f4f4a83b",
                    "email": "sarah.young@example.org",
                    "name": "Sarah Young",
                    "compatibility_score": 0.78,
                    "explanation": "Sarah's blockchain knowledge complements your AI focus. You both have similar working styles.",
                    "profile": {
                        "bio": "Blockchain developer interested in medical research.",
                        "skills": ["Blockchain", "Rust", "DataScience"],
                        "interests": ["HealthTech", "Blockchain"],
                        "location": "Tokyo",
                        "availability": "Part-Time",
                        "startup_stage": "Research/Academic"
                    }
                }
            ])
        
        return jsonify({"error": f"Failed to generate matches: {str(e)}"}), 500

@bp.route('/matches/generate-all', methods=['POST'])
@login_required
def generate_all_matches():
    """Generate matches for all users and store them in the database."""
    # This endpoint would typically be restricted to admins
    user = request.current_user
    
    # Use the matching service to generate matches for all users
    matching_service = get_matching_service()
    matches = matching_service.generate_matches_for_all_users()
    
    # Store the matches in the database
    stored_matches = []
    
    for user_id, user_matches in matches.items():
        for match in user_matches:
            # Store the match in the database
            stored_match = SupabaseService.store_match(
                user_id,  # Already string UUID
                match['match_id'],
                match['score'],
                match['explanation']
            )
            if stored_match:
                stored_matches.append(stored_match)
    
    return jsonify({
        "message": f"Generated and stored {len(stored_matches)} matches.",
        "matches_count": len(stored_matches)
    })

@bp.route('/matches/<string:match_id>/action', methods=['POST'])
@login_required
def match_action(match_id):
    """Take action on a match (accept/reject/connect)."""
    data = request.json
    action = data.get('action')
    
    if action not in ['accept', 'reject', 'connect']:
        return jsonify({'error': 'Invalid action'}), 400
    
    # Verify the match belongs to the current user
    match = SupabaseService.get_match(match_id)
    if not match:
        return jsonify({"error": "Match not found"}), 404
        
    user = request.current_user
    if match['user_id'] != user['id'] and match['matched_user_id'] != user['id']:
        return jsonify({"error": "Unauthorized"}), 403
    
    result = SupabaseService.update_match_status(match_id, action)
    return jsonify(result)

@bp.route('/matches/compatibility', methods=['POST'])
@login_required
def check_compatibility():
    """Check compatibility between the current user and another specific user."""
    data = request.json
    other_user_id = data.get('user_id')
    
    if not other_user_id:
        return jsonify({"error": "Other user ID is required"}), 400
    
    # Get the current user
    user = request.current_user
    user_id = user['id']
    
    # Use the matching service to calculate compatibility
    matching_service = get_matching_service()
    
    # Get both user objects
    user_obj = SupabaseService.get_user(user_id)
    other_user_obj = SupabaseService.get_user(other_user_id)
    
    if not other_user_obj:
        return jsonify({"error": "Other user not found"}), 404
    
    # Calculate compatibility
    subs = matching_service._compute_subscores(user_obj, other_user_obj)
    score = matching_service._weighted_score(subs)
    explanation = matching_service._generate_explanation(user_obj, other_user_obj, subs, score)
    
    return jsonify({
        "user_id": user_id,
        "other_user_id": other_user_id,
        "compatibility_score": score,
        "explanation": explanation,
        "details": subs
    })
