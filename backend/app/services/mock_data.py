"""
Mock data for testing the application without a real Supabase connection.
"""

MOCK_USERS = [
    {
        "id": 1,
        "username": "techfounder",
        "email": "tech@example.com",
        "first_name": "Alex",
        "last_name": "Johnson",
        "skills": ["Python", "AI", "React", "Node.js"],
        "interests": ["Technology", "Startups", "Machine Learning"],
        "goals": "Build MVP",
        "startup_stage": "Idea/Concept",
        "location": "San Francisco",
        "availability": "Full-time",
        "collab_style": "Visionary"
    },
    {
        "id": 2,
        "username": "business_guru",
        "email": "business@example.com",
        "first_name": "Sam",
        "last_name": "Williams",
        "skills": ["Marketing", "Sales", "Business Development", "Finance"],
        "interests": ["E-commerce", "SaaS", "Digital Marketing"],
        "goals": "Get funded",
        "startup_stage": "Prototype",
        "location": "New York",
        "availability": "Part-time",
        "collab_style": "Planner"
    },
    {
        "id": 3,
        "username": "design_master",
        "email": "design@example.com",
        "first_name": "Jordan",
        "last_name": "Lee",
        "skills": ["UI/UX", "Graphic Design", "Branding", "Product Design"],
        "interests": ["Design", "User Experience", "Mobile Apps"],
        "goals": "Join accelerator",
        "startup_stage": "Prototype",
        "location": "San Francisco",
        "availability": "Full-time",
        "collab_style": "Creative"
    },
    {
        "id": 4,
        "username": "data_scientist",
        "email": "data@example.com",
        "first_name": "Taylor",
        "last_name": "Smith",
        "skills": ["DataScience", "Python", "Statistics", "Machine Learning"],
        "interests": ["AI", "Data Analytics", "Fintech"],
        "goals": "Build MVP",
        "startup_stage": "Idea/Concept",
        "location": "Boston",
        "availability": "Student - flexible",
        "collab_style": "Analytical"
    },
    {
        "id": 5,
        "username": "healthcare_innovator",
        "email": "healthcare@example.com",
        "first_name": "Morgan",
        "last_name": "Chen",
        "skills": ["Medicine", "Biology", "Healthcare Administration"],
        "interests": ["Healthcare", "Biotech", "Telemedicine"],
        "goals": "Find CTO",
        "startup_stage": "Research/Academic",
        "location": "Boston",
        "availability": "Part-time",
        "collab_style": "Connector"
    }
]

MOCK_PROFILES = [
    {
        "id": 1,
        "user_id": 1,
        "bio": "Tech founder with experience in AI and software development.",
        "looking_for": "Business co-founder with marketing and sales experience",
        "linkedin_url": "https://linkedin.com/in/alexjohnson",
        "github_url": "https://github.com/alexjohnson",
        "avatar_url": "https://randomuser.me/api/portraits/men/1.jpg"
    },
    {
        "id": 2,
        "user_id": 2,
        "bio": "Business professional with expertise in marketing and sales.",
        "looking_for": "Technical co-founder who can build the product",
        "linkedin_url": "https://linkedin.com/in/samwilliams",
        "github_url": None,
        "avatar_url": "https://randomuser.me/api/portraits/men/2.jpg"
    },
    {
        "id": 3,
        "user_id": 3,
        "bio": "Designer with a passion for creating beautiful, user-friendly products.",
        "looking_for": "Technical and business co-founders to complete the team",
        "linkedin_url": "https://linkedin.com/in/jordanlee",
        "github_url": "https://github.com/jordanlee",
        "avatar_url": "https://randomuser.me/api/portraits/women/3.jpg"
    },
    {
        "id": 4,
        "user_id": 4,
        "bio": "Data scientist with a background in AI and machine learning.",
        "looking_for": "Business co-founder who understands the fintech market",
        "linkedin_url": "https://linkedin.com/in/taylorsmith",
        "github_url": "https://github.com/taylorsmith",
        "avatar_url": "https://randomuser.me/api/portraits/women/4.jpg"
    },
    {
        "id": 5,
        "user_id": 5,
        "bio": "Healthcare professional looking to innovate in the medical space.",
        "looking_for": "Technical co-founder with experience in healthcare technology",
        "linkedin_url": "https://linkedin.com/in/morganchen",
        "github_url": None,
        "avatar_url": "https://randomuser.me/api/portraits/men/5.jpg"
    }
]

MOCK_MATCHES = [] 