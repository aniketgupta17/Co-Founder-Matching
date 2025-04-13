# Co-Founder Matching Backend

This is the Flask backend API for the Co-Founder Matching application. It provides endpoints for user authentication, profile management, and co-founder matching functionality.

## Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Setup and Installation](#setup-and-installation)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Matching Algorithm](#matching-algorithm)
- [Integration with Supabase](#integration-with-supabase)
- [Frontend Integration](#frontend-integration)
- [Testing](#testing)
- [Deployment](#deployment)

## Architecture

The backend follows a modular architecture:

- **API**: Routes and endpoint handlers organized by resource type and version
- **Services**: Business logic and external service integrations (Supabase, matching algorithm)
- **Models**: SQLAlchemy ORM models for database entities
- **Core**: Configuration and application setup components

## Features

- **Authentication & Authorization**: JWT-based authentication system
- **User Management**: Create, read, update, and delete user accounts
- **Profile Management**: Store and retrieve detailed user profiles with skills and interests
- **Co-Founder Matching**: Advanced algorithm for finding compatible co-founders
- **Match Management**: Accept, reject, or connect with potential matches

## Setup and Installation

### Prerequisites

- Python 3.9+
- PostgreSQL (optional, can use Supabase directly)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/Co-Founder-Matching.git
   cd Co-Founder-Matching/backend
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```
   
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
   
5. Edit the `.env` file with your configuration values:
   ```
   # Flask settings
   FLASK_APP=app.wsgi:app
   FLASK_ENV=development
   SECRET_KEY=your-secret-key-here

   # Database settings
   DATABASE_URL=postgresql://user:password@localhost:5432/yourdb

   # Supabase settings
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your-supabase-key

   # JWT settings
   JWT_SECRET_KEY=your-jwt-secret-key
   JWT_ACCESS_TOKEN_EXPIRES=3600  # 1 hour
   ```

6. Run the development server:
   ```
   flask run --port=5001 --debug
   ```

### Troubleshooting Setup

If you encounter issues:

1. Ensure your virtual environment is activated
2. Verify Python version is 3.9+
3. Check that all dependencies installed correctly
4. Make sure environment variables are properly set
5. Check for any missing packages and install them manually

## API Endpoints

### Authentication

- `POST /api/v1/auth/login` - Login with email and password
  - Request: `{ "email": "user@example.com", "password": "password123" }`
  - Response: `{ "token": "jwt-token", "user": { ... } }`
- `GET /api/v1/auth/me` - Get current authenticated user
  - Headers: `Authorization: Bearer jwt-token`
- `POST /api/v1/auth/refresh` - Refresh JWT token
  - Headers: `Authorization: Bearer jwt-token`

### Users

- `GET /api/v1/users` - List all users
- `GET /api/v1/users/:id` - Get user by ID
- `GET /api/v1/users/email/:email` - Get user by email
- `POST /api/v1/users` - Create a new user
  - Request: `{ "name": "User Name", "email": "user@example.com", ... }`
- `PUT /api/v1/users/:id` - Update a user
  - Request: `{ "name": "Updated Name", ... }`
- `DELETE /api/v1/users/:id` - Delete a user

### Profiles

- `GET /api/v1/profiles` - List all profiles
- `GET /api/v1/profiles/:id` - Get profile by ID
- `GET /api/v1/users/:id/profile` - Get profile for user
- `GET /api/v1/me/profile` - Get current user's profile
  - Headers: `Authorization: Bearer jwt-token`
- `POST /api/v1/profiles` - Create a new profile
  - Request: `{ "user_id": 1, "skills": ["Python", "AI"], ... }`
- `PUT /api/v1/profiles/:id` - Update a profile
  - Request: `{ "skills": ["Python", "AI", "React"], ... }`
- `DELETE /api/v1/profiles/:id` - Delete a profile

### Matching

- `GET /api/v1/matches` - List all matches for current user
- `GET /api/v1/matches/:id` - Get match by ID
- `GET /api/v1/matches/recommend` - Get match recommendations using the algorithm
  - Query params: `count=5` (optional, default 5)
- `POST /api/v1/matches/:id/action` - Take action on a match
  - Request: `{ "action": "accept|reject|connect" }`
- `POST /api/v1/matches/generate-all` - Generate matches for all users (admin)
- `POST /api/v1/matches/compatibility` - Check compatibility between users
  - Request: `{ "user_id": 2 }` (Check compatibility with user 2)

## Data Models

### User Model

```python
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    profile = db.relationship('Profile', backref='user', uselist=False, lazy=True)
```

### Profile Model

```python
class Profile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    bio = db.Column(db.Text)
    skills = db.Column(db.JSON)  # Stored as JSON array
    interests = db.Column(db.JSON)  # Stored as JSON array
    looking_for = db.Column(db.Text)
    linkedin_url = db.Column(db.String(255))
    github_url = db.Column(db.String(255))
    avatar_url = db.Column(db.String(255))
    location = db.Column(db.String(100))
```

### Match Model

```python
class Match(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    matched_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    compatibility_score = db.Column(db.Float)
    status = db.Column(db.String(20), default='pending')  # pending, accepted, rejected, connected
    initiated_by = db.Column(db.Integer, db.ForeignKey('users.id'))
```

## Matching Algorithm

The co-founder matching algorithm considers several factors to calculate compatibility between users:

1. **Skill Overlap (weight 2.0)** - Matching based on shared skills
2. **Complementary Skill Synergy (weight 1.5)** - Finding skills that work well together (e.g., Python + AI, DataScience + AI)
3. **Interest Overlap (weight 1.5)** - Matching based on shared interests
4. **Goal Alignment (weight 2.0)** - Compatibility of business goals
5. **Startup Stage Alignment (weight 2.0)** - Compatibility of startup stages
6. **Location Synergy (weight 1.0)** - Benefits of being in the same location
7. **Availability Synergy (weight 0.5)** - Compatibility of schedules
8. **Collaboration Style Synergy (weight 1.0)** - Compatibility of working styles

Each match includes a detailed explanation of the compatibility factors and an overall compatibility score.

### Generating Matches

There are two ways to generate matches:

1. **On-Demand** - Call the `/api/v1/matches/recommend` endpoint to get recommendations for a specific user
2. **Bulk Generation** - Use the `/api/v1/matches/generate-all` endpoint or run the script `python scripts/generate_matches.py` to generate matches for all users

For production, you might want to set up a scheduled task to regenerate matches periodically.

## Integration with Supabase

This backend is designed to work with Supabase as the database and authentication provider. For development and testing, it currently uses mock data.

### Setting Up Supabase (For Production)

1. Create a Supabase account and project at [supabase.com](https://supabase.com)
2. Set up the necessary tables in your Supabase database:
   - users
   - profiles
   - matches
3. Get your Supabase URL and API key from the Supabase dashboard
4. Add these to your `.env` file

### Development Mode

The backend uses a mock implementation by default for development and testing, so you can run it without a Supabase account. The mock data includes 5 sample users with different skills and profiles.

## Testing

### Running Tests

Run all tests with:

```
python run_tests.py
```

This will start a test server and run through all the API endpoints.

## Deployment

For deployment in production, make sure to:

1. Update SECRET_KEY, JWT_SECRET_KEY, and other sensitive values
2. Set FLASK_ENV=production
3. Use a production WSGI server (Gunicorn) instead of the Flask development server
4. Set up proper logging and monitoring
5. Consider using Docker for containerization 