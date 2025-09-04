"""
EAMP Python SDK exceptions
"""

from typing import Any, Dict, Optional


class EAMPError(Exception):
    """Base EAMP error"""
    
    def __init__(
        self, 
        message: str, 
        code: str = "EAMP_ERROR", 
        field: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message)
        self.code = code
        self.field = field
        self.details = details or {}

    def __str__(self) -> str:
        return f"[{self.code}] {super().__str__()}"

    def __repr__(self) -> str:
        return f"EAMPError(message={super().__str__()!r}, code={self.code!r})"


class ResourceNotFoundError(EAMPError):
    """Resource not found error"""
    
    def __init__(self, message: str):
        super().__init__(message, code="RESOURCE_NOT_FOUND")


class ValidationError(EAMPError):
    """Validation error"""
    
    def __init__(self, message: str, field: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, code="VALIDATION_ERROR", field=field, details=details)


class NetworkError(EAMPError):
    """Network error"""
    
    def __init__(self, message: str):
        super().__init__(message, code="NETWORK_ERROR")


class AuthenticationError(EAMPError):
    """Authentication error"""
    
    def __init__(self, message: str):
        super().__init__(message, code="AUTHENTICATION_ERROR")


class AuthorizationError(EAMPError):
    """Authorization error"""
    
    def __init__(self, message: str):
        super().__init__(message, code="AUTHORIZATION_ERROR")


class RateLimitError(EAMPError):
    """Rate limit error"""
    
    def __init__(self, message: str, retry_after: Optional[int] = None):
        super().__init__(message, code="RATE_LIMIT_ERROR")
        self.retry_after = retry_after


class ServerError(EAMPError):
    """Server error"""
    
    def __init__(self, message: str, status_code: int):
        super().__init__(message, code="SERVER_ERROR")
        self.status_code = status_code


class TimeoutError(EAMPError):
    """Timeout error"""
    
    def __init__(self, message: str, timeout: int):
        super().__init__(message, code="TIMEOUT_ERROR")
        self.timeout = timeout


class ConfigurationError(EAMPError):
    """Configuration error"""
    
    def __init__(self, message: str):
        super().__init__(message, code="CONFIGURATION_ERROR")


class CacheError(EAMPError):
    """Cache operation error"""
    
    def __init__(self, message: str):
        super().__init__(message, code="CACHE_ERROR")


class TransportError(EAMPError):
    """Transport layer error"""
    
    def __init__(self, message: str, transport_type: str):
        super().__init__(message, code="TRANSPORT_ERROR")
        self.transport_type = transport_type