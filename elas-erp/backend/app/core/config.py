from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    app_name: str = Field(default="Elas ERP Backend", alias="APP_NAME")
    app_env: str = Field(default="dev", alias="APP_ENV")
    app_host: str = Field(default="0.0.0.0", alias="APP_HOST")
    app_port: int = Field(default=8000, alias="APP_PORT")

    # LLM
    groq_api_key: str = Field(default="", alias="GROQ_API_KEY")
    groq_model: str = Field(default="llama-3.3-70b-versatile", alias="GROQ_MODEL")

    # Supabase Storage
    supabase_url: str = Field(default="", alias="SUPABASE_URL")
    supabase_service_role_key: str = Field(default="", alias="SUPABASE_SERVICE_ROLE_KEY")
    supabase_bucket: str = Field(default="elas-uploads", alias="SUPABASE_BUCKET")

    # Security
    secret_key: str = Field(default="dev-secret-key-change-in-production", alias="SECRET_KEY")
    allowed_origins: str = Field(default="http://localhost:4000", alias="ALLOWED_ORIGINS")

    # DB / cache
    database_url: str = Field(default="sqlite:///./elas_erp.db", alias="DATABASE_URL")
    redis_url: str | None = Field(default=None, alias="REDIS_URL")

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
