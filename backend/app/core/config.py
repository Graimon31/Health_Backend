from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    database_url: str = 'postgresql+psycopg://health_user:health_pass@db:5432/health'
    jwt_secret: str = 'change_me'
    jwt_algorithm: str = 'HS256'
    access_token_expire_minutes: int = 30
    refresh_token_expire_minutes: int = 60 * 24 * 7
    cors_origins: str = 'http://localhost:8080'
    admin_email: str = 'admin@example.com'
    admin_password: str = 'change_me'
    admin_full_name: str = 'System Admin'


settings = Settings()
