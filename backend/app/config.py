import os
from pydantic import BaseModel
from typing import Optional

class Settings(BaseModel):
    PROJECT_NAME: str = "UtsavSetu"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENV: str = os.getenv("APP_ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() in ("true", "1")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "utsavsetu-super-secret-key-production-change-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "utsavsetu_db")
    USE_LOCAL_FALLBACK: bool = True  # Automatically falls back to resilient local JSON store if Mongo is unreachable
    
    # Frontend Base URL (for public RSVP links)
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    # WhatsApp Cloud API Credentials
    WHATSAPP_API_TOKEN: Optional[str] = os.getenv("WHATSAPP_API_TOKEN", None)
    WHATSAPP_PHONE_NUMBER_ID: Optional[str] = os.getenv("WHATSAPP_PHONE_NUMBER_ID", None)
    WHATSAPP_BUSINESS_ACCOUNT_ID: Optional[str] = os.getenv("WHATSAPP_BUSINESS_ACCOUNT_ID", None)
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: str = os.getenv("WHATSAPP_WEBHOOK_VERIFY_TOKEN", "utsavsetu_verify_token_2026")

settings = Settings()

