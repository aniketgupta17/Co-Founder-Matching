from fastapi import APIRouter
from fastapi import APIRouter, HTTPException, Request
from fastapi_app.supabase_client import supabase

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

@router.get("/profile/{user_id}")
def get_user_profile(user_id: str):
    response = supabase.table("Users").select("*").eq("id", user_id).limit(1).execute()
    if response.data and len(response.data) > 0:
        return {"message": "User profile retrieved", "data": response.data[0]}
    else:
        raise HTTPException(status_code=404, detail="User not found")


@router.post("/signup")
async def signup(request: Request):
    body = await request.json()
    email = body.get("email")
    password = body.get("password")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required.")

    try:
        response = supabase.auth.sign_up({
            "email": email,
            "password": password
        })
        return {"message": "User registered!", "data": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

