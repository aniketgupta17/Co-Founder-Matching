from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SUPABASE_JWT_SECRET: str
    SUPABASE_JWT_ALGORITHM: str

    class Config:
        env_file = ".env"


settings = Settings()
