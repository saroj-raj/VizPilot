from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    app_name: str = Field(default="VizPilot Backend", alias="APP_NAME")
    app_env: str = Field(default="dev", alias="APP_ENV")
    app_host: str = Field(default="0.0.0.0", alias="APP_HOST")
    app_port: int = Field(default=8000, alias="APP_PORT")

    # Supabase
    supabase_url: str = Field(default="", alias="SUPABASE_URL")
    supabase_anon_key: str = Field(default="", alias="SUPABASE_ANON_KEY")
    supabase_service_role_key: str = Field(default="", alias="SUPABASE_SERVICE_ROLE_KEY")

    # LLM
    groq_api_key: str = Field(default="", alias="GROQ_API_KEY")
    groq_model: str = Field(default="llama-3.3-70b-versatile", alias="GROQ_MODEL")  # Updated: llama-3.1 was decommissioned
    groq_mode: str = Field(default="live", alias="GROQ_MODE")  # "live" or "mock" for testing

    # Auth
    auth_mode: str = Field(default="live", alias="AUTH_MODE")  # "live" or "mock" for testing

    # Storage
    aws_region: str = Field(default="us-east-1", alias="AWS_REGION")
    s3_endpoint_url: str | None = Field(default=None, alias="S3_ENDPOINT_URL")
    s3_bucket: str = Field(default="elas-erp-demo", alias="S3_BUCKET")
    s3_access_key: str | None = Field(default=None, alias="S3_ACCESS_KEY")
    s3_secret_key: str | None = Field(default=None, alias="S3_SECRET_KEY")

    # DB / cache
    database_url: str = Field(default="sqlite:///./elas_erp.db", alias="DATABASE_URL")
    redis_url: str | None = Field(default=None, alias="REDIS_URL")

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

