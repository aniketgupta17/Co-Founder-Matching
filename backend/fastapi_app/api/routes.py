from fastapi import APIRouter

router = APIRouter()

@router.get("/home")
def get_home_data():
    return {
        "message": "Welcome to the UQ Ventures Co-Founder Matching App!"
    }

@router.get("/match")
def get_match_data():
    return {
        "message": "Here are some recommended co-founders for you:",
        "recommendedUsers": [
            {"id": 1, "name": "Alice - UX Designer"},
            {"id": 2, "name": "Bob - Full-Stack Dev"},
            {"id": 3, "name": "Carol - Marketing Guru"}
        ]
    }

@router.get("/chat")
def get_chat_data():
    return {
        "message": "Recent chats:",
        "chats": [
            {"id": 101, "name": "Startup Brainstorm", "lastMessage": "Let's meet tomorrow!"},
            {"id": 102, "name": "Funding Ideas", "lastMessage": "Checked some grants..."},
        ]
    }

@router.get("/profile")
def get_profile_data():
    return {
        "message": "Profile details fetched successfully",
        "profile": {
            "name": "John Founder",
            "avatar": "https://placehold.co/100.png",
            "skills": ["React", "Product Management", "Pitching"]
        }
    }