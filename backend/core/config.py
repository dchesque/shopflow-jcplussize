"""
Configurações do backend
"""

from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str = "https://orzzycayjzgcuvcsrxsi.supabase.co"
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    
    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8001
    API_DEBUG: bool = False
    API_SECRET_KEY: str = "secret-key-change-me"
    
    # Bridge API
    BRIDGE_API_KEY: str = "bridge_api_key_123"
    
    # YOLO/AI
    YOLO_MODEL: str = "yolo11n.pt"
    YOLO_CONFIDENCE: float = 0.6
    YOLO_IOU: float = 0.45
    DETECTION_CLASSES: List[int] = [0]  # 0 = person
    
    # Tracking
    TRACKING_MAX_DISAPPEARED: int = 30
    TRACKING_MAX_DISTANCE: float = 50.0
    LINE_POSITION: int = 50  # Percentage from top
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_PASSWORD: str = ""
    
    # File Storage
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    SNAPSHOT_RETENTION_DAYS: int = 7
    SAVE_SNAPSHOTS: bool = True
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/backend.log"
    
    # Monitoring
    PROMETHEUS_ENABLED: bool = True
    PROMETHEUS_PORT: int = 8090
    HEALTH_CHECK_ENABLED: bool = True
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["https://shopflow-frontend.hshars.easypanel.host", "http://localhost:3000", "http://localhost:3001"]
    
    # WebSocket
    WS_MAX_CONNECTIONS: int = 100
    WS_HEARTBEAT_INTERVAL: int = 30
    
    class Config:
        env_file = ".env.local"  # Use .env.local for development
        extra = "allow"

settings = Settings()

def get_settings() -> Settings:
    """Função para obter configurações"""
    return settings