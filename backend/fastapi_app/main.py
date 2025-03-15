from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_app.api.routes import router as mock_router

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

# Root endpoint
@app.get("/")
def root():
    return {"message": "Mock API Root"}

# Add mock router
app.include_router(mock_router, prefix="/api", tags=["Mock"])