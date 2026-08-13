"""Application configuration loaded from environment variables."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./airbnb_clone.db"
    jwt_secret: str = "dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]
    # "development": cookie works over plain HTTP for same-site localhost ports.
    # "production": frontend/backend are on different domains (e.g. vercel.app / onrender.com),
    # which is cross-site, so the cookie must be SameSite=None + Secure (HTTPS-only) to be sent.
    environment: str = "development"
    # Own public URL, e.g. https://airbnb-clone-backend.onrender.com. Set only in production;
    # used to self-ping and stop Render's free-tier instance from spinning down when idle.
    public_url: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cookie_samesite(self) -> str:
        return "lax" if self.environment == "development" else "none"

    @property
    def cookie_secure(self) -> bool:
        return self.environment != "development"


settings = Settings()
