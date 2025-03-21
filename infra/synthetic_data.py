# synthetic_data.py

from faker import Faker
import random
import json
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

fake = Faker()

# Define synthetic data pools
skills = ["Python", "React", "Design", "Marketing", "AI", "Sales", "Finance", "Flutter", "Node.js", "Pitching"]
interests = ["HealthTech", "EdTech", "FinTech", "GreenTech", "SaaS", "Marketplace"]
startup_goals = ["Find CTO", "Build MVP", "Get funded", "Recruit team", "Join accelerator", "Launch product"]

# Generate synthetic user profiles
def generate_user_profile(uid):
    return {
        "id": uid,
        "name": fake.name(),
        "email": fake.email(),
        "bio": fake.sentence(),
        "skills": random.sample(skills, k=3),
        "interests": random.sample(interests, k=2),
        "goals": random.choice(startup_goals),
        "location": fake.city(),
        "availability": random.choice(["Evenings", "Weekends", "Full-Time"]),
    }

# Convert a user profile to a binary vector for similarity
def profile_to_vector(user):
    vector = [0] * (len(skills) + len(interests))
    for s in user["skills"]:
        if s in skills:
            vector[skills.index(s)] = 1
    for i in user["interests"]:
        if i in interests:
            vector[len(skills) + interests.index(i)] = 1
    return np.array(vector)

# Generate users
users = [generate_user_profile(i) for i in range(1, 51)]  # 50 users

# Generate compatibility scores (cosine similarity)
vectors = [profile_to_vector(u) for u in users]
scores = cosine_similarity(vectors)

# Build match recommendations
match_recommendations = {}
for i, score_vector in enumerate(scores):
    matches = sorted(
        [(j, float(score)) for j, score in enumerate(score_vector) if j != i],
        key=lambda x: -x[1]
    )[:3]  # Top 3 matches
    match_recommendations[users[i]["id"]] = [users[j]["id"] for j, _ in matches]

# Save users and matches to JSON
output = {
    "users": users,
    "match_recommendations": match_recommendations
}

with open("synthetic_users.json", "w") as f:
    json.dump(output, f, indent=4)

print("✅ synthetic_users.json generated successfully with 50 users and top-3 matches each.")