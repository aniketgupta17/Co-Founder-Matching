from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as mock_router

app = FastAPI(title="Mock API for Co-Founder Matching")

# Allow CORS from anywhere (for local dev). Lock down in production!
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
