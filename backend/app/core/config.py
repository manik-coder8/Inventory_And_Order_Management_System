"""
Application configuration.
All values are read from environment variables (see .env.example).
Never hardcode credentials here.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5432/inventory_db"
    cors_origins: str = "http://localhost:3000,http://localhost:5173"
    low_stock_threshold: int = 10
    api_title: str = "Inventory & Order Management System"
    api_version: str = "1.0.0"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
