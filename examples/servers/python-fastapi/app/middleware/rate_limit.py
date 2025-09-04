"""Rate limiting middleware for EAMP FastAPI server."""

import time
from collections import defaultdict, deque
from typing import Callable, DefaultDict, Deque

from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware for rate limiting requests."""
    
    def __init__(self, app, **kwargs):
        super().__init__(app, **kwargs)
        self.requests_per_minute = settings.rate_limit.requests_per_minute
        self.burst_limit = settings.rate_limit.burst
        self.window_size = 60  # 60 seconds
        
        # Store request timestamps by IP
        self.requests: DefaultDict[str, Deque[float]] = defaultdict(deque)
        
        # Paths to skip rate limiting
        self.skip_paths = {
            "/health",
            settings.monitoring.metrics_endpoint,
        }
    
    async def dispatch(
        self, request: Request, call_next: Callable
    ) -> Response:
        """Process the request with rate limiting."""
        # Skip rate limiting for certain paths
        if request.url.path in self.skip_paths:
            return await call_next(request)
        
        # Skip for WebSocket upgrades
        if request.headers.get("upgrade") == "websocket":
            return await call_next(request)
        
        # Get client IP
        client_ip = self._get_client_ip(request)
        current_time = time.time()
        
        # Clean old requests outside the window
        self._clean_old_requests(client_ip, current_time)
        
        # Check if rate limit exceeded
        request_count = len(self.requests[client_ip])
        
        if request_count >= self.requests_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": {
                        "code": "RATE_LIMIT_EXCEEDED",
                        "message": "Too many requests, please try again later",
                    }
                },
                headers={
                    "Retry-After": "60",
                    "X-RateLimit-Limit": str(self.requests_per_minute),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int(current_time + 60)),
                },
            )
        
        # Record this request
        self.requests[client_ip].append(current_time)
        
        # Process the request
        response = await call_next(request)
        
        # Add rate limit headers
        remaining = max(0, self.requests_per_minute - len(self.requests[client_ip]))
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(current_time + 60))
        
        return response
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address."""
        # Check for forwarded IP (if behind a proxy)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # Take the first IP if multiple are present
            return forwarded_for.split(",")[0].strip()
        
        # Check for real IP header
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fall back to client host
        return request.client.host if request.client else "unknown"
    
    def _clean_old_requests(self, client_ip: str, current_time: float) -> None:
        """Remove requests older than the window size."""
        request_times = self.requests[client_ip]
        cutoff_time = current_time - self.window_size
        
        # Remove old requests
        while request_times and request_times[0] < cutoff_time:
            request_times.popleft()
        
        # Clean up empty deques
        if not request_times:
            del self.requests[client_ip]