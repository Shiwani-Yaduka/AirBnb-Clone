"""Application configuration loaded from environment variables."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./airbnb_clone.db"
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]
    # Gates the keep-alive self-ping thread (see core/keep_alive.py), production only.
    environment: str = "development"
    # Own public URL, e.g. https://airbnb-clone-backend.onrender.com. Set only in production;
    # used to self-ping and stop Render's free-tier instance from spinning down when idle.
    public_url: str = ""
    # Clerk secret key, used server-side to verify session tokens and fetch user profiles.
    clerk_secret_key: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
