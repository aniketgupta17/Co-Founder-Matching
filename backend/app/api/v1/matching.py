from flask import jsonify, request
from . import bp
from ...services.supabase_service import SupabaseService
from ...services.matching_service import get_matching_service
from ...services.auth_service import login_required

# Matching endpoints
@bp.route('/matches', methods=['GET'])
@login_required
def get_matches():
    """Get a list of all matches for the authenticated user."""
    # Get user from request context (set by login_required decorator)
    user = request.current_user
    user_id = user['id']
    #
    matches = SupabaseService.get_matches(user_id)
    return jsonify(matches)

@bp.route('/matches/<string:match_id>', methods=['GET'])
@login_required
def get_match(match_id):
    """Get a specific match by ID."""
    match = SupabaseService.get_match(match_id)
    
    if match is None:
        return jsonify({"error": "Match not found"}), 404
        
    # Check if the match belongs to the current user
    user = request.current_user
    if match['user_1'] != user['id'] and match['user_2'] != user['id']:
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
    
    # Use the matching service to generate matches
    matching_service = get_matching_service()
    recommended_matches = matching_service.generate_matches_for_user(user_id, top_n=count)
    
    return jsonify(recommended_matches)

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
                int(user_id),
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

@bp.route('/matches/<int:match_id>/action', methods=['POST'])
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
