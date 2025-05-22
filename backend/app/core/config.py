import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Base config class."""

    # Flask
    SECRET_KEY = os.environ.get("SECRET_KEY", "development-key")
    DEBUG = os.environ.get("FLASK_ENV") == "development"

    # JWT
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = int(
        os.environ.get("JWT_ACCESS_TOKEN_EXPIRES", 3600)
    )  # Default 1 hour

    # Supabase
    SUPABASE_URL = os.environ.get("SUPABASE_URL")
    SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
    print(SUPABASE_URL)
    print(SUPABASE_KEY)

    # HuggingFace - For the chatbot
    HUGGINGFACE_API_TOKEN = os.environ.get("HF_API_TOKEN")

    @classmethod
    def check_config(cls):
        """Check if all required config values are set."""
        missing = []
        if not cls.SUPABASE_URL:
            missing.append("SUPABASE_URL")
        if not cls.SUPABASE_KEY:
            missing.append("SUPABASE_KEY")
        if missing:
            raise ValueError(
                f"Missing required environment variables: {', '.join(missing)}"
            )

        print(f"Supabase URL: {cls.SUPABASE_URL[:20]}...")
        print(f"Environment: {'Development' if cls.DEBUG else 'Production'}")
        if cls.HUGGINGFACE_API_TOKEN:
            print(f"HuggingFace API token is set")
        else:
            print(
                f"Warning: HuggingFace API token is not set. Chatbot will use fallback responses."
            )

        return True


class TestConfig(Config):
    """Configuration for testing."""

    TESTING = True


class ProductionConfig(Config):
    """Configuration for production."""

    DEBUG = False
    TESTING = False
