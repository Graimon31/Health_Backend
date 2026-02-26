from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Health Backend"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "CHANGE_THIS_TO_A_SECURE_SECRET_KEY"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    DATABASE_URL: str

    CORS_ORIGINS: List[str] = ["http://localhost:8080", "http://localhost:5173"]

    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "admin"
    DEMO_SEED: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
