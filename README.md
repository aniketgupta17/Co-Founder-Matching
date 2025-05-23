# Co-Founder Matching Platform

## Overview

This project is a prototype platform to help entrepreneurs find compatible co-founders using a matching algorithm, chat, and AI-powered business advice. It consists of a Flask backend (Python) and a React Native frontend (Expo). The backend uses Supabase for authentication and data storage.

## Quick Start Guide

### Prerequisites

- **Backend:** Python 3.8+, pip, Supabase account
- **Frontend:** Node.js (v16+), npm, Expo Go app (iOS/Android)
- **General:** Git, internet connection

---

### 1. Clone the Repository

```bash
git clone --branch final-submission git@github.com:aniketgupta17/Co-Founder-Matching.git cofounder-match
cd cofounder-match
```

---

### 2. Backend Setup

1. **Install dependencies:**

```bash
cd backend
# Optional
# python -m venv .venv
# .venv/Scripts/activate
pip install -r requirements.txt
```

2. **Create `.env` file in `backend/` with:**

```bash
FLASK_APP=app.wsgi:app
FLASK_ENV=development
JWT_ACCESS_TOKEN_EXPIRES=3600
# These will be supplied to the tutors during exhibition
SECRET_KEY=...
SUPABASE_URL=...
SUPABASE_KEY=...
JWT_SECRET_KEY=...
HF_API_TOKEN=...
```

---

### 3. Frontend Setup

1. **Install dependencies:**

```bash
cd ../frontend
npm install --legacy-peer-deps
```

- Scan the QR code with Expo Go on your mobile device.

---

### 4. Run

1. Run Backend

```bash
# Inside /backend
python -m flask run --debug --port=8000
```

2. Run Frontend

```bash
# Inside /frontend
npx expo start -c
```

Then scan QR code on phone or press 'w' to run on web

---

## Credentials

- **Supabase Username:** closedai.deco3801@gmail.com
- **Supabase Password:** ...

---

## Attribution & Compliance

- All open-source libraries, Supabase, and Expo are used with attribution.
- AI tools (ChatGPT, Copilot) were used for code and documentation; all prompts are listed in the team technical report appendix.
- All team members contributed and have signed the coversheet and declaration.
- No proprietary or previous DECO project code was used.

---
