#!/usr/bin/env python3
"""
complete_matchmaking.py

Performs a detailed matchmaking on user data from 'synthetic_users.json'
and outputs 'advanced_match_results.json' with top 5 matches per user,
including in-depth explanations and sub-score breakdowns.

Factors considered (all optional, can be toggled in the WEIGHTS dict):
  1. Skill Overlap
  2. Complementary Skill Synergy
  3. Interest Overlap
  4. Goal Alignment
  5. Startup Stage Alignment
  6. Location Synergy
  7. Availability Synergy
  8. Collaboration Style Synergy

Each user will have a list of top 5 matches, each with:
  - match_id
  - score (rounded)
  - a verbose explanation referencing all relevant factors
"""

import json
import itertools
from collections import defaultdict

# ------------------------------------------------------------------
# 1) WEIGHTS & MAPPINGS
# ------------------------------------------------------------------

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
    "CivilEngineering": { "MechanicalEngineering": 1.5 },
    "MechanicalEngineering": { "CivilEngineering": 1.5 },
    "Medicine": { "Biology": 1.5, "Pharmacy": 1.0 },
    "Biology": { "Medicine": 1.5, "Pharmacy": 1.0 },
    "Pharmacy": { "Medicine": 1.0, "Biology": 1.0 },
    # etc. Expand as desired
}

# Potential synergy or friction among collaboration styles (example)
# If not found here, synergy is assumed 0
COLLAB_STYLE_SYNERGY = {
    ("Visionary", "Planner"): 1.0,
    ("Visionary", "Analytical"): 0.8,
    ("Planner", "Executor"): 1.0,
    ("Analytical", "Creative"): 0.8,
    ("Connector", "Visionary"): 0.7,
    # etc. add more if you like
}

# ------------------------------------------------------------------
# 2) DATA LOADING
# ------------------------------------------------------------------

def load_users_from_json(path="synthetic_users.json"):
    """
    Expects a JSON with structure: { "users": [ {...}, {...} ] }
    Each user is expected to have fields:
      id, skills, interests, goals, location, availability, etc.
    """
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["users"]

# ------------------------------------------------------------------
# 3) SCORING SUB-FUNCTIONS
# ------------------------------------------------------------------

def skill_overlap(userA, userB):
    """
    Return (count, shared_skills) for skill overlap.
    """
    setA = set(userA.get("skills", []))
    setB = set(userB.get("skills", []))
    shared = setA.intersection(setB)
    return (len(shared), shared)

def complementary_skill_synergy(userA, userB):
    """
    Sum synergy from complementary skill pairs + a list of synergy details.
    """
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

def interest_overlap(userA, userB):
    """
    Return (count, shared_interests).
    """
    setA = set(userA.get("interests", []))
    setB = set(userB.get("interests", []))
    shared = setA.intersection(setB)
    return (len(shared), shared)

def goal_alignment(userA, userB):
    """
    Return numeric sub-score (0..1) and descriptor.
    """
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

def stage_alignment(userA, userB):
    """
    Return numeric sub-score (0..1) and descriptor.
    """
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

def location_synergy(userA, userB):
    """
    Example synergy: +1 if they're in the same location, else 0.
    If you want partial synergy for same region or country, you can expand.
    """
    locA = userA.get("location")
    locB = userB.get("location")
    if locA and locB and locA == locB:
        return 1.0
    return 0.0

def availability_synergy(userA, userB):
    """
    Example synergy: if they have the exact same availability => 0.5 synergy
    If one is 'Student - flexible' => partial synergy. Modify as you prefer.
    """
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

def collab_style_synergy(userA, userB):
    """
    If both have 'collab_style', look up synergy in a matrix. 
    We'll check both (styleA, styleB) and (styleB, styleA).
    If not found, synergy = 0.
    """
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

# ------------------------------------------------------------------
# 4) COMPOSITE SCORE + DETAILS
# ------------------------------------------------------------------

def compute_subscores(userA, userB):
    """
    Compute each factor, return them in a dict for explanation & weighting.
    E.g.:
    {
      "skill_overlap_count": 2,
      "shared_skills": [...],
      "complement_sum": 3.5,
      "complement_details": [...],
      ...
      "location_val": 1.0,
      "availability_val": 0.5,
      "collab_style_val": 1.0
    }
    """
    # Skills
    so_count, so_shared = skill_overlap(userA, userB)
    cs_sum, cs_details = complementary_skill_synergy(userA, userB)

    # Interests
    io_count, io_shared = interest_overlap(userA, userB)

    # Goals
    ga_val, ga_desc = goal_alignment(userA, userB)

    # Stage
    st_val, st_desc = stage_alignment(userA, userB)

    # Location
    loc_val = location_synergy(userA, userB)

    # Availability
    ava_val = availability_synergy(userA, userB)

    # Collaboration style
    cstyle_val = collab_style_synergy(userA, userB)

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

def weighted_score(subscores):
    """
    Combine the subscores with the global WEIGHTS to yield a final numeric match score.
    """
    return round(
        (subscores["skill_overlap_count"] * WEIGHTS["skill_overlap"])
      + (subscores["complement_sum"]        * WEIGHTS["complementary_skills"])
      + (subscores["interest_overlap_count"]* WEIGHTS["interest_overlap"])
      + (subscores["goal_val"]              * WEIGHTS["goal_alignment"])
      + (subscores["stage_val"]             * WEIGHTS["stage_alignment"])
      + (subscores["location_val"]          * WEIGHTS["location_synergy"])
      + (subscores["availability_val"]      * WEIGHTS["availability_synergy"])
      + (subscores["collab_style_val"]      * WEIGHTS["collab_style_synergy"]),
        3
    )

# ------------------------------------------------------------------
# 5) EXPLANATION GENERATION
# ------------------------------------------------------------------

def generate_explanation(userA, userB, subscores, final_score):
    """
    Return a detailed multi-sentence explanation referencing:
      - Skills (shared + complementary)
      - Interests
      - Goals/stage alignment
      - Location, availability, collaboration style synergy
      - Final numeric score
    """
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

    # Complementary synergy
    if cs_sum > 0:
        # Build a short detail for synergy pairs if you want to highlight them
        # e.g. "Python + AI (1.2), CivilEngineering + MechanicalEngineering (1.5)"
        synergy_strs = [
            f"{a}+{b} ({val})"
            for (a, b, val) in cs_details
        ]
        lines.append(
            f"Complementary skills total {cs_sum} synergy points "
            f"(e.g. {', '.join(synergy_strs)})."
        )

    # Interest Overlap
    if io_count > 0:
        lines.append(
            f"Shared interest{'s' if io_count>1 else ''}: {', '.join(io_shared)}."
        )

    # Goal alignment
    if goal_val > 0:
        if goal_desc == "exact":
            lines.append("Your goals align perfectly.")
        else:
            lines.append("Your goals partially align.")

    # Stage alignment
    if stage_val > 0:
        if stage_desc == "exact":
            lines.append("You're both at the same startup stage.")
        else:
            lines.append("There's partial alignment in your startup stages.")

    # Location synergy
    if loc_val > 0:
        # e.g. "Both located in London => synergy"
        lines.append(f"You share the same location for a +{loc_val} synergy.")

    # Availability synergy
    if ava_val > 0:
        lines.append(
            f"Availability synergy contributes +{ava_val} "
            "(similar schedules or 'Student - flexible')."
        )

    # Collaboration style synergy
    if cstyle_val > 0:
        lines.append(f"Your collaboration styles add +{cstyle_val} synergy.")

    # If no lines so far, we might say there's minimal synergy
    if not lines:
        lines.append("You have limited direct overlap, but there may still be potential to explore.")

    # Final numeric mention
    lines.append(f"Overall match score: {final_score}.")

    # Combine into a single explanation
    explanation = " ".join(lines)
    return explanation

# ------------------------------------------------------------------
# 6) TOP MATCH GENERATION
# ------------------------------------------------------------------

def generate_top_matches(users, top_n=5):
    """
    For each user, compute match scores with all others, pick top N,
    and produce a { user_id: [ {match_id, score, explanation}, ... ] } dict.
    """
    # Precompute sub-scores
    # We'll store them in recs_dict[uidA] = list of match infos
    recs_dict = defaultdict(list)

    for userA, userB in itertools.permutations(users, 2):
        uidA = userA["id"]
        uidB = userB["id"]

        subs = compute_subscores(userA, userB)
        score_val = weighted_score(subs)

        recs_dict[uidA].append({
            "match_id": uidB,
            "score": score_val,
            "subscores": subs
        })

    # Now pick top N for each user
    output = {}
    for uid in recs_dict:
        # Sort descending
        sorted_list = sorted(recs_dict[uid], key=lambda x: x["score"], reverse=True)
        top_matches = sorted_list[:top_n]

        # Build final objects with explanation
        userA = next(u for u in users if u["id"] == uid)
        match_objs = []
        for match_info in top_matches:
            mid = match_info["match_id"]
            sc = match_info["score"]
            subs = match_info["subscores"]

            userB = next(u for u in users if u["id"] == mid)
            expl = generate_explanation(userA, userB, subs, sc)

            match_objs.append({
                "match_id": mid,
                "score": sc,
                "explanation": expl
            })

        output[str(uid)] = match_objs

    return output

# ------------------------------------------------------------------
# 7) MAIN
# ------------------------------------------------------------------

def main():
    # 1) Load data
    users = load_users_from_json("synthetic_users.json")
    print(f"Loaded {len(users)} users from 'synthetic_users.json'.")

    # 2) Generate top matches
    best_matches = generate_top_matches(users, top_n=5)

    # 3) Save to JSON
    out_data = {"best_matches": best_matches}
    with open("advanced_match_results.json", "w", encoding="utf-8") as f:
        json.dump(out_data, f, indent=4)

    print("Wrote 'advanced_match_results.json' with top 5 matches per user (score + detailed explanation).")

if __name__ == "__main__":
    main()