"""
Extended Accessibility Metadata Protocol (EAMP) Python SDK

This package provides Python tools for working with the EAMP protocol,
including client and server implementations for accessibility metadata exchange.
"""

__version__ = "1.0.0"
__author__ = "Shaft Finance"
__email__ = "hello@shaft.finance"

# Core client and server classes
from .client import EAMPClient
from .server import EAMPServer

# Data models
from .models import (
    EAMPMetadata,
    DataPoint,
    Scene,
    VisualElement,
    Context,
    MetadataFilter,
    MetadataUpdate,
    ClientOptions,
    ServerInfo,
    ContentType,
)

# Exceptions
from .exceptions import (
    EAMPError,
    ResourceNotFoundError,
    ValidationError,
    NetworkError,
    AuthenticationError,
    AuthorizationError,
    RateLimitError,
    ServerError,
    TimeoutError,
)

# Transport classes
from .transport import HttpTransport, WebSocketTransport

# Utilities
from .utils import validate_metadata, validate_filter

__all__ = [
    # Version info
    "__version__",
    "__author__", 
    "__email__",
    
    # Core classes
    "EAMPClient",
    "EAMPServer",
    
    # Models
    "EAMPMetadata",
    "DataPoint",
    "Scene", 
    "VisualElement",
    "Context",
    "MetadataFilter",
    "MetadataUpdate",
    "ClientOptions",
    "ServerInfo",
    "ContentType",
    
    # Exceptions
    "EAMPError",
    "ResourceNotFoundError",
    "ValidationError",
    "NetworkError",
    "AuthenticationError",
    "AuthorizationError", 
    "RateLimitError",
    "ServerError",
    "TimeoutError",
    
    # Transport
    "HttpTransport",
    "WebSocketTransport",
    
    # Utils
    "validate_metadata",
    "validate_filter",
]