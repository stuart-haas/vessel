from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration, loaded from environment variables or a .env file."""

    model_config = SettingsConfigDict(env_file=".env", env_prefix="VESSEL_", extra="ignore")

    # scripture.api.bible credentials + defaults
    bible_api_url: str = "https://api.scripture.api.bible/v1"
    bible_api_key: str = "2c3fac5f2c049f578953ef5bdd7e6c69"
    default_bible_id: str = "de4e12af7f2817c0-01"

    # Persistence
    database_url: str = "sqlite:///./vessel.db"

    # CORS: comma-separated list of allowed origins ("*" allows all)
    cors_origins: str = "*"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
