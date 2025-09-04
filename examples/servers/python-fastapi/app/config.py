"""Configuration management for EAMP FastAPI server."""

import os
from typing import List, Optional

from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings


class ServerConfig(BaseModel):
    """Server configuration."""
    environment: str = Field(default="development")
    host: str = Field(default="0.0.0.0")
    port: int = Field(default=8000)
    debug: bool = Field(default=False)
    reload: bool = Field(default=True)
    workers: int = Field(default=1)


class DatabaseConfig(BaseModel):
    """Database configuration."""
    url: str = Field(default="sqlite+aiosqlite:///./data/eamp.db")


class SecurityConfig(BaseModel):
    """Security configuration."""
    secret_key: str = Field(default="change-me-in-production")
    access_token_expire_minutes: int = Field(default=30)
    api_key_header: Optional[str] = Field(default="X-API-Key")
    valid_api_keys: List[str] = Field(default_factory=list)


class CORSConfig(BaseModel):
    """CORS configuration."""
    allowed_origins: List[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
        ]
    )
    allowed_methods: List[str] = Field(
        default_factory=lambda: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    )
    allowed_headers: List[str] = Field(
        default_factory=lambda: ["Content-Type", "Authorization", "Accept", "X-API-Key"]
    )


class CacheConfig(BaseModel):
    """Cache configuration."""
    ttl_seconds: int = Field(default=300)
    max_size: int = Field(default=1000)


class RateLimitConfig(BaseModel):
    """Rate limiting configuration."""
    requests_per_minute: int = Field(default=60)
    burst: int = Field(default=10)


class WebSocketConfig(BaseModel):
    """WebSocket configuration."""
    max_connections: int = Field(default=100)
    heartbeat_interval_seconds: int = Field(default=30)


class MonitoringConfig(BaseModel):
    """Monitoring configuration."""
    enable_metrics: bool = Field(default=True)
    metrics_endpoint: str = Field(default="/metrics")


class LoggingConfig(BaseModel):
    """Logging configuration."""
    level: str = Field(default="INFO")
    format: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )


class Settings(BaseSettings):
    """Application settings."""
    
    # Server
    environment: str = Field(default="development", env="ENVIRONMENT")
    host: str = Field(default="0.0.0.0", env="HOST")
    port: int = Field(default=8000, env="PORT")
    debug: bool = Field(default=False, env="DEBUG")
    reload: bool = Field(default=True, env="RELOAD")
    workers: int = Field(default=1, env="WORKERS")
    
    # Database
    database_url: str = Field(
        default="sqlite+aiosqlite:///./data/eamp.db", 
        env="DATABASE_URL"
    )
    
    # Security
    secret_key: str = Field(
        default="change-me-in-production", 
        env="SECRET_KEY"
    )
    access_token_expire_minutes: int = Field(
        default=30, 
        env="ACCESS_TOKEN_EXPIRE_MINUTES"
    )
    api_key_header: Optional[str] = Field(
        default="X-API-Key", 
        env="API_KEY_HEADER"
    )
    valid_api_keys_str: str = Field(default="", env="VALID_API_KEYS")
    
    # CORS
    allowed_origins_str: str = Field(
        default="http://localhost:3000,http://localhost:3001,http://localhost:5173",
        env="ALLOWED_ORIGINS"
    )
    allowed_methods_str: str = Field(
        default="GET,POST,PUT,PATCH,DELETE,OPTIONS",
        env="ALLOWED_METHODS"
    )
    allowed_headers_str: str = Field(
        default="Content-Type,Authorization,Accept,X-API-Key",
        env="ALLOWED_HEADERS"
    )
    
    # Cache
    cache_ttl_seconds: int = Field(default=300, env="CACHE_TTL_SECONDS")
    cache_max_size: int = Field(default=1000, env="CACHE_MAX_SIZE")
    
    # Rate Limiting
    rate_limit_requests_per_minute: int = Field(
        default=60, 
        env="RATE_LIMIT_REQUESTS_PER_MINUTE"
    )
    rate_limit_burst: int = Field(default=10, env="RATE_LIMIT_BURST")
    
    # WebSocket
    ws_max_connections: int = Field(default=100, env="WS_MAX_CONNECTIONS")
    ws_heartbeat_interval_seconds: int = Field(
        default=30, 
        env="WS_HEARTBEAT_INTERVAL_SECONDS"
    )
    
    # Monitoring
    enable_metrics: bool = Field(default=True, env="ENABLE_METRICS")
    metrics_endpoint: str = Field(default="/metrics", env="METRICS_ENDPOINT")
    
    # Logging
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_format: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        env="LOG_FORMAT"
    )
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
    
    @property
    def server(self) -> ServerConfig:
        """Get server configuration."""
        return ServerConfig(
            environment=self.environment,
            host=self.host,
            port=self.port,
            debug=self.debug,
            reload=self.reload,
            workers=self.workers,
        )
    
    @property
    def database(self) -> DatabaseConfig:
        """Get database configuration."""
        return DatabaseConfig(url=self.database_url)
    
    @property
    def security(self) -> SecurityConfig:
        """Get security configuration."""
        valid_keys = (
            [key.strip() for key in self.valid_api_keys_str.split(",") if key.strip()]
            if self.valid_api_keys_str
            else []
        )
        return SecurityConfig(
            secret_key=self.secret_key,
            access_token_expire_minutes=self.access_token_expire_minutes,
            api_key_header=self.api_key_header,
            valid_api_keys=valid_keys,
        )
    
    @property
    def cors(self) -> CORSConfig:
        """Get CORS configuration."""
        origins = [o.strip() for o in self.allowed_origins_str.split(",") if o.strip()]
        methods = [m.strip() for m in self.allowed_methods_str.split(",") if m.strip()]
        headers = [h.strip() for h in self.allowed_headers_str.split(",") if h.strip()]
        
        return CORSConfig(
            allowed_origins=origins,
            allowed_methods=methods,
            allowed_headers=headers,
        )
    
    @property
    def cache(self) -> CacheConfig:
        """Get cache configuration."""
        return CacheConfig(
            ttl_seconds=self.cache_ttl_seconds,
            max_size=self.cache_max_size,
        )
    
    @property
    def rate_limit(self) -> RateLimitConfig:
        """Get rate limit configuration."""
        return RateLimitConfig(
            requests_per_minute=self.rate_limit_requests_per_minute,
            burst=self.rate_limit_burst,
        )
    
    @property
    def websocket(self) -> WebSocketConfig:
        """Get WebSocket configuration."""
        return WebSocketConfig(
            max_connections=self.ws_max_connections,
            heartbeat_interval_seconds=self.ws_heartbeat_interval_seconds,
        )
    
    @property
    def monitoring(self) -> MonitoringConfig:
        """Get monitoring configuration."""
        return MonitoringConfig(
            enable_metrics=self.enable_metrics,
            metrics_endpoint=self.metrics_endpoint,
        )
    
    @property
    def logging(self) -> LoggingConfig:
        """Get logging configuration."""
        return LoggingConfig(
            level=self.log_level,
            format=self.log_format,
        )


# Global settings instance
settings = Settings()