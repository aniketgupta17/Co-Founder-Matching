# Co-Founder Matching API

A RESTful API for a co-founder matching application, built with Flask and Supabase.

## Overview

This API powers a co-founder matching application that helps entrepreneurs find compatible co-founders based on skills, interests, and other criteria. The application uses a sophisticated matching algorithm to suggest potential co-founders, and provides functionality for users to interact with their matches.

## Features

- User authentication (signup, login, token management)
- Profile creation and management
- Co-founder matching algorithm
- Match recommendation system
- Chat/messaging between matched users
- Match acceptance/rejection with cooldown period

## API Flow

The application follows this user flow:

1. **Authentication**: Users register or login to receive a JWT token.
2. **Profile Completion**: Users create or update their profile with skills, interests, etc.
3. **Matching**: The system recommends compatible co-founders based on the user's profile.
4. **Match Actions**: Users can accept or reject recommended matches.
5. **Conversations**: When two users mutually accept each other, they can start a conversation.
6. **Messaging**: Users can exchange messages within conversations.

## Getting Started

### Prerequisites

- Python 3.8+
- Supabase account

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/co-founder-matching.git
cd co-founder-matching/backend
```

2. Install dependencies
```
pip install -r requirements.txt
```

3. Set up environment variables
```
# Create a .env file with the following variables
FLASK_APP=app.wsgi:app
FLASK_ENV=development
SECRET_KEY=your_secret_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET_KEY=your_jwt_secret
JWT_ACCESS_TOKEN_EXPIRES=3600  # 1 hour
```

4. Create required database tables
```
python create_tables.py
```

5. Run the application
```
flask run
```

## Testing

You can test the complete API flow using the included test script:

```
python test_api_flow.py
```

This script will:
1. Register a new test user
2. Login with the user credentials
3. Create and update a profile
4. Get match recommendations
5. Accept a match
6. Create a conversation
7. Send and retrieve messages

## Complete API Endpoints Reference

### Authentication Endpoints

- `GET /health` - Check if the server is running
- `POST /api/v1/auth/signup` - Register a new user
  - Request: `{ "email": "user@example.com", "password": "password123", "name": "User Name" }`
  - Response: `{ "token": "jwt_token", "user": { "id": "user_id", "email": "user@example.com" } }`

- `POST /api/v1/auth/login` - Login a user
  - Request: `{ "email": "user@example.com", "password": "password123" }`
  - Response: `{ "token": "jwt_token", "user": { "id": "user_id", "email": "user@example.com" } }`

- `GET /api/v1/auth/me` - Get current user info (requires authentication)
  - Response: `{ "id": "user_id", "email": "user@example.com", "user_metadata": { "name": "User Name" } }`

### Profile Endpoints

- `GET /api/v1/me/profile` - Get current user's profile (requires authentication)
  - Response: `{ "id": "profile_id", "user_id": "user_id", "name": "User Name", ... }`

- `POST /api/v1/profiles` - Create a profile (requires authentication)
  - Request: `{ "name": "User Name", "bio": "About me", "skills": ["Skill1", "Skill2"], ... }`
  - Response: `{ "profile": { "id": "profile_id", "user_id": "user_id", ... }, "is_complete": true }`

- `PUT /api/v1/profiles/{id}` - Update a profile (requires authentication)
  - Request: `{ "bio": "Updated bio", "skills": ["Skill1", "Skill2", "Skill3"], ... }`
  - Response: `{ "id": "profile_id", "user_id": "user_id", "bio": "Updated bio", ... }`

- `GET /api/v1/profiles/{id}` - Get a specific profile
  - Response: `{ "id": "profile_id", "user_id": "user_id", "name": "User Name", ... }`

### Matching Endpoints

- `GET /api/v1/matches/recommend` - Get match recommendations (requires authentication)
  - Response: `[{ "user_id": "user_id", "compatibility_score": 0.85, "profile": { ... } }, ... ]`

- `POST /api/v1/matches/{id}/action` - Take action on a match (requires authentication)
  - Request: `{ "action": "accept" }` or `{ "action": "reject", "reason": "Not interested" }`
  - Response: `{ "id": "match_id", "status": "accept", ... }`

- `GET /api/v1/matches` - Get all matches for the current user (requires authentication)
  - Response: `[{ "id": "match_id", "user_id": "user_id", "matched_user_id": "matched_user_id", ... }, ... ]`

- `GET /api/v1/matches/accepted` - Get all accepted matches (requires authentication)
  - Response: `[{ "id": "match_id", "status": "accept", "profile": { ... }, ... }, ... ]`

- `GET /api/v1/matches/rejected` - Get all rejected matches (requires authentication)
  - Response: `[{ "id": "match_id", "status": "reject", "profile": { ... }, ... }, ... ]`

- `POST /api/v1/matches/direct` - Create a direct match with another user (requires authentication)
  - Request: `{ "user_id": "user_id_to_match_with" }`
  - Response: `{ "id": "match_id", "user_id": "your_user_id", "matched_user_id": "matched_user_id", ... }`

- `GET /api/v1/matches/{match_id}` - Get a specific match by ID (requires authentication)
  - Response: `{ "id": "match_id", "user_id": "user_id", "matched_user_id": "matched_user_id", ... }`

### Conversation Endpoints

- `GET /api/v1/conversations` - Get all conversations (requires authentication)
  - Response: `[{ "id": "conversation_id", "user_id_1": "user_id", "user_id_2": "other_user_id", ... }, ... ]`

- `POST /api/v1/conversations` - Create a new conversation (requires authentication)
  - Request: `{ "user_id": "user_id_to_chat_with" }`
  - Response: `{ "id": "conversation_id", "user_id_1": "your_user_id", "user_id_2": "other_user_id", ... }`

- `GET /api/v1/conversations/{id}` - Get a specific conversation (requires authentication)
  - Response: `{ "id": "conversation_id", "user_id_1": "user_id", "user_id_2": "other_user_id", ... }`

- `GET /api/v1/conversations/{id}/messages` - Get messages in a conversation (requires authentication)
  - Response: `[{ "id": "message_id", "conversation_id": "conversation_id", "content": "Message content", ... }, ... ]`

- `POST /api/v1/conversations/{id}/messages` - Send a message in a conversation (requires authentication)
  - Request: `{ "content": "Hello, I'd like to discuss a potential partnership!" }`
  - Response: `{ "id": "message_id", "conversation_id": "conversation_id", "content": "Hello...", ... }`

### User Endpoints

- `GET /api/v1/users` - Get all users
  - Response: `[{ "id": "user_id", "email": "user@example.com", ... }, ... ]`

- `GET /api/v1/users/{id}` - Get a specific user
  - Response: `{ "id": "user_id", "email": "user@example.com", ... }`

- `GET /api/v1/users/email/{email}` - Get a user by email
  - Response: `{ "id": "user_id", "email": "user@example.com", ... }`

- `GET /api/v1/users/search` - Search for users
  - Query parameters: `?q=search_term`
  - Response: `[{ "id": "user_id", "email": "user@example.com", ... }, ... ]`

## Database Schema

The application uses Supabase with the following tables:

- `profiles` - User profiles with matching information
- `matches` - Connections between users with status and compatibility
- `conversations` - Chat conversations between matched users
- `conversation_messages` - Individual messages in conversations

## Status

The API is now fully functional with all critical issues resolved. The following features are working:

- User authentication (signup, login)
- Profile management (create, update, retrieve)
- Match recommendation system
- Match actions (accept, reject)
- Conversation management
- Messaging between matched users

All endpoints have been thoroughly tested and are ready for frontend integration.

## Known Limitations

- The API currently uses polling for messages rather than real-time updates. Future versions may implement WebSocket support.
- The matching algorithm could be further enhanced with more sophisticated compatibility metrics.

