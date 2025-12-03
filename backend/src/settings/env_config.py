import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from enum import Enum

class Environment(str, Enum):
    DEVELOPMENT = "development"
    PRODUCTION = "production"

class Settings(BaseSettings):
    # Ambiente
    environment: Environment = Environment.DEVELOPMENT
        
    # Servidor
    host: str = "0.0.0.0"
    port: int = 8001
    debug: bool = True
    
    # MLflow
    mlflow_tracking_uri: str = "http://0.0.0.0:5000"
    
    # Logging
    log_level: str = "INFO"
    
    # API Keys
    google_api_key: Optional[str] = None
    tavily_api_key: Optional[str] = None
    google_news_api_key: Optional[str] = None
    
    # CORS
    cors_origins: list = ["http://localhost:8100",
                          "http://localhost:5173"]
    
    # Paths
    google_application_credentials: str = '/home/rolalquiaga/credentials/ntg-ambiental-c0dcbb853294.json'    

    class Config:
        env_file = ".env"
        case_sensitive = False

class DevelopmentSettings(Settings):
    environment: Environment = Environment.DEVELOPMENT
    debug: bool = True
    log_level: str = "DEBUG"


class ProductionSettings(Settings):
    environment: Environment = Environment.PRODUCTION
    debug: bool = False
    log_level: str = "WARNING"
    host: str = "0.0.0.0"
    port: int = 8002

def get_settings() -> Settings:
    env = os.getenv("ENVIRONMENT", "development").lower()
    
    if env == "production":
        return ProductionSettings()
    else:
        return DevelopmentSettings()

env_settings = get_settings()