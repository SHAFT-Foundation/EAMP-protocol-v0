"""Authentication middleware for EAMP FastAPI server."""

from typing import Callable

from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings


class AuthMiddleware(BaseHTTPMiddleware):
    """Middleware for API key authentication."""
    
    def __init__(self, app, **kwargs):
        super().__init__(app, **kwargs)
        self.api_key_header = settings.security.api_key_header
        self.valid_keys = set(settings.security.valid_api_keys)
        
        # Paths that don't require authentication
        self.public_paths = {
            "/health",
            "/info",
            "/docs",
            "/redoc",
            "/openapi.json",
        }
        
        # Allow GET requests to metadata in development
        self.allow_dev_get = settings.environment == "development"
    
    async def dispatch(
        self, request: Request, call_next: Callable
    ) -> Response:
        """Process the request."""
        # Skip authentication for public paths
        if request.url.path in self.public_paths:
            return await call_next(request)
        
        # Skip authentication for WebSocket upgrade requests
        if request.headers.get("upgrade") == "websocket":
            return await call_next(request)
        
        # Allow GET requests in development
        if (
            self.allow_dev_get 
            and request.method == "GET" 
            and request.url.path.startswith("/metadata")
        ):
            return await call_next(request)
        
        # Check API key for protected routes
        if not self.valid_keys:
            # No API keys configured, allow all requests
            return await call_next(request)
        
        # Get API key from header
        api_key = request.headers.get(self.api_key_header or "X-API-Key")
        
        if not api_key or api_key not in self.valid_keys:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "error": {
                        "code": "AUTHENTICATION_ERROR",
                        "message": "Valid API key required",
                    }
                },
            )
        
        return await call_next(request)