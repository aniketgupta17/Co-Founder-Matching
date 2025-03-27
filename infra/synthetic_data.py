#!/usr/bin/env python3
"""
synthetic_data.py

Generates synthetic user data in a JSON format that roughly matches
the style you've described (with a 'users' array). Each user has:
 - id, name, email
 - bio (multi-paragraph)
 - skills, interests
 - goals, location, availability
 - startup_stage, collab_style
 - education (institution, degree, graduation_year)
 - work_experience (list of past roles)

The script writes to 'synthetic_users.json' by default.
"""

import json
import random

NUM_USERS = 20  # Adjust as needed (e.g., 50, 100, 500, etc.)

def generate_skills_pool():
    """
    Expanded skill pool: includes software, business, mechanical,
    medical, etc.
    """
    return [
        "Python", "Node.js", "React", "Flutter", "AI", "DataScience", "Go", "Rust",
        "Sales", "Marketing", "Design", "Finance", "Pitching",
        "CivilEngineering", "MechanicalEngineering", "Biology", "Medicine",
        "Pharmacy", "Chemistry", "CAD", "LabResearch", "Automation"
    ]

def generate_interests_pool():
    """
    Expanded interests: software, engineering, medical, plus other domains.
    """
    return [
        "SaaS", "GreenTech", "HealthTech", "FinTech", "EdTech",
        "Marketplace", "AR/VR", "Blockchain", "IoT",
        "MedTech", "BioTech", "Pharma", "Construction", "RenewableEnergy",
        "Aerospace", "Robotics", "UrbanPlanning"
    ]

def generate_goals_pool():
    """
    Goals for co-founders.
    """
    return [
        "Build MVP", "Get funded", "Join accelerator", "Launch product",
        "Recruit team", "Find CTO", "Scale internationally", "Expand research lab"
    ]

def generate_location_pool():
    """
    Variety of locations (global).
    """
    return [
        "New York", "Melbourne", "Seoul", "Dubai", "London", "San Francisco",
        "Berlin", "Brisbane", "Tokyo", "Singapore", "Oxford", "Boston"
    ]

def generate_availability_pool():
    """
    Various availabilities, plus 'Student - flexible'.
    """
    return ["Full-Time", "Part-Time", "Weekends", "Evenings", "Student - flexible"]

def generate_stage_pool():
    """
    Startup stage categories.
    """
    return [
        "Idea/Concept",
        "Prototype",
        "Research/Academic",
        "Early Clinical Trials",
        "Seed Funded",
        "Series A+"
    ]

def generate_collab_style_pool():
    """
    Basic collaboration/personality styles.
    """
    return [
        "Visionary", "Planner", "Connector", "Executor",
        "Analytical", "Creative"
    ]

def random_subset(source_list, max_count=3):
    """
    Return a random subset (between 1..max_count items) from source_list.
    """
    count = random.randint(1, max_count)
    return random.sample(source_list, count)

def random_paragraph():
    """
    Generates a random paragraph that references a variety
    of engineering, medical, or software terms.
    """
    templates = [
        "Specializing in {focus_area}, with hands-on experience in {tech_stack}. Seeking to {impact} and collaborate with likeminded {industry} professionals.",
        "Led a {adjective} {project_type} focusing on {focus_area}. Achieved {result} by implementing {tech_stack}.",
        "Worked at {company} as a {role}, where I spearheaded initiatives to {impact}. This experience involved {tasks}.",
        "Passionate about {focus_area} and driving innovation in {industry}. Recently contributed to a {project_type} that {result}.",
        "Oversaw cross-functional teams at {company}, improving {tech_stack} processes and delivering {result} within {time_frame}."
    ]
    placeholders = {
        "adjective": [
            "scalable", "clinical-grade", "innovative", "user-centric",
            "groundbreaking", "high-impact"
        ],
        "project_type": [
            "MVP", "platform", "solution", "product", "service", "clinical trial"
        ],
        "focus_area": [
            "machine learning", "blockchain solutions", "CAD simulations",
            "robotic automation processes", "cloud infrastructure",
            "gene therapy research", "digital marketing", "UI/UX optimization"
        ],
        "result": [
            "a 40% efficiency increase", "a successful Series A funding",
            "FDA approval", "substantial cost savings",
            "ISO certification", "product-market fit"
        ],
        "tech_stack": [
            "Python and AI frameworks", "React and Node.js", "DataScience pipelines",
            "Rust microservices", "Flutter mobile apps", "CAD-based design tools"
        ],
        "company": [
            "Global Solutions", "InnovateX", "CivilDesign Pro", "BioNext",
            "NextGen Labs", "GreenBuild Innovations", "TechCorp", "MediCore"
        ],
        "role": [
            "Product Owner", "Medical Researcher", "Mechanical Engineer",
            "Data Scientist", "Design Lead", "Full-stack Developer"
        ],
        "impact": [
            "create sustainable solutions", "optimize large-scale deployments",
            "grow developer communities", "advance medical research",
            "increase brand awareness", "improve user experience"
        ],
        "tasks": [
            "managing stakeholder requirements", "conducting user research",
            "writing production-level code", "leading field inspections",
            "analyzing data to drive decisions", "creating marketing campaigns"
        ],
        "industry": [
            "HealthTech", "FinTech", "GreenTech", "MedTech", "EdTech",
            "Civil Engineering", "Mechanical Systems", "BioTech", "SaaS"
        ],
        "time_frame": [
            "the first two quarters", "a tight Q3 timeline", "six months",
            "the product launch phase"
        ]
    }

    template = random.choice(templates)
    filled = template.format(
        adjective=random.choice(placeholders["adjective"]),
        project_type=random.choice(placeholders["project_type"]),
        focus_area=random.choice(placeholders["focus_area"]),
        result=random.choice(placeholders["result"]),
        tech_stack=random.choice(placeholders["tech_stack"]),
        company=random.choice(placeholders["company"]),
        role=random.choice(placeholders["role"]),
        impact=random.choice(placeholders["impact"]),
        tasks=random.choice(placeholders["tasks"]),
        industry=random.choice(placeholders["industry"]),
        time_frame=random.choice(placeholders["time_frame"])
    )
    return filled

def generate_descriptive_bio(paragraph_count=3):
    """
    Build a multi-paragraph bio. Each paragraph is a random_paragraph().
    """
    paragraphs = []
    for _ in range(paragraph_count):
        paragraphs.append(random_paragraph())
    return "\n\n".join(paragraphs)

def generate_education():
    """
    Create an education dict: institution, degree, graduation_year.
    """
    unis = [
        "MIT", "Harvard University", "Cambridge University", "Oxford University",
        "Technical University of Munich", "Imperial College London",
        "Stanford University", "University of Queensland"
    ]
    degrees = [
        "BSc Computer Science", "MBA", "BEng Mechanical Engineering", "BSc Finance",
        "MSc Data Science", "PhD AI Research", "BEng Civil Engineering",
        "MBBS Medicine", "BPharm Pharmacy"
    ]
    return {
        "institution": random.choice(unis),
        "degree": random.choice(degrees),
        "graduation_year": random.randint(2005, 2023)
    }

def generate_work_experience():
    """
    Create a small list of roles: {company, position, years}
    """
    possible_companies = [
        "Google", "Amazon", "Facebook", "Airbnb", "IBM", "Tesla", "SpaceX",
        "Global Pharma Inc", "CityWorks Construction", "BioNext", "GreenBuild Innovations"
    ]
    possible_positions = [
        "Product Owner", "Medical Researcher", "Mechanical Engineer",
        "Data Analyst", "Design Lead", "Full-stack Developer",
        "Marketing Manager", "Software Engineer"
    ]

    num_positions = random.randint(1, 3)
    experience_list = []
    for _ in range(num_positions):
        experience = {
            "company": random.choice(possible_companies),
            "position": random.choice(possible_positions),
            "years": random.randint(1, 7)
        }
        experience_list.append(experience)
    return experience_list

def create_random_user(user_id):
    """
    Constructs a single synthetic user entry with all required fields.
    """
    # Pools
    skills_pool = generate_skills_pool()
    interests_pool = generate_interests_pool()
    goals_pool = generate_goals_pool()
    location_pool = generate_location_pool()
    availability_pool = generate_availability_pool()
    stage_pool = generate_stage_pool()
    collab_style_pool = generate_collab_style_pool()

    # Names
    first_names = [
        "Alice", "Bob", "Carol", "David", "Eva", "Frank", "Grace",
        "Hank", "Iris", "Jack", "Kevin", "Linda", "Mona", "Nick",
        "Olivia", "Pete", "Quinn", "Rachel", "Sarah", "Tom", "Uma",
        "Victor", "Wendy", "Xavier", "Yvonne", "Zack", "Fiona",
        "Seth", "Tina", "Iris", "Kim", "Laura", "Michael"
    ]
    last_names = [
        "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller",
        "Davis", "Garcia", "Rodriguez", "Wilson", "Martinez",
        "Anderson", "Taylor", "Thomas", "Hernandez", "Moore",
        "Lee", "Clark", "Lewis", "Walker", "Young", "Allen",
        "Hall", "Adams", "Baker", "Campbell"
    ]

    name = f"{random.choice(first_names)} {random.choice(last_names)}"
    email = f"{name.replace(' ', '.').lower()}@example.org"

    user = {
        "id": user_id,
        "name": name,
        "email": email,
        "bio": generate_descriptive_bio(paragraph_count=random.randint(2,4)),
        "skills": random_subset(skills_pool, max_count=3),
        "interests": random_subset(interests_pool, max_count=3),
        "goals": random.choice(goals_pool),
        "location": random.choice(location_pool),
        "availability": random.choice(availability_pool),
        "startup_stage": random.choice(stage_pool),
        "collab_style": random.choice(collab_style_pool),
        "education": generate_education(),
        "work_experience": generate_work_experience()
    }
    return user

def naive_recommendations(users):
    """
    Simple random picks of 3 'recommended' user IDs per user.
    Just to keep some 'match_recommendations' key if needed.
    """
    recommendations = {}
    user_ids = [u["id"] for u in users]

    for user in users:
        uid = user["id"]
        possible_ids = [x for x in user_ids if x != uid]
        recs = random.sample(possible_ids, min(3, len(possible_ids)))
        recommendations[str(uid)] = recs

    return recommendations

def generate_synthetic_data(num_users=NUM_USERS):
    """
    Build a list of user dicts with the fields we want.
    """
    users = []
    for i in range(1, num_users + 1):
        users.append(create_random_user(i))

    # Keep or remove naive_recommendations as you prefer
    match_recs = naive_recommendations(users)

    data = {
        "users": users,
        "match_recommendations": match_recs
    }
    return data

if __name__ == "__main__":
    synthetic_data = generate_synthetic_data(NUM_USERS)

    # Write JSON
    with open("synthetic_users.json", "w", encoding="utf-8") as f:
        json.dump(synthetic_data, f, indent=4)

    print(f"Created 'synthetic_users.json' with {NUM_USERS} synthetic user profiles!")