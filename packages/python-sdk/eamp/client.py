"""
EAMP Python Client for consuming accessibility metadata
"""

import asyncio
import json
import logging
from typing import Any, Callable, Dict, List, Optional, Set
from urllib.parse import quote

import httpx
from pydantic import ValidationError as PydanticValidationError

from .models import (
    EAMPMetadata,
    MetadataFilter, 
    MetadataUpdate,
    ClientOptions,
    EAMPError as EAMPErrorModel
)
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
from .utils import MemoryCache


logger = logging.getLogger(__name__)


class EAMPClient:
    """
    EAMP Client for consuming accessibility metadata
    
    Example:
        ```python
        client = EAMPClient(ClientOptions(base_url="https://api.example.com"))
        
        # Get metadata
        metadata = await client.get_metadata("chart-2024")
        print(metadata.extended_description)
        
        # Subscribe to updates
        await client.subscribe("chart-2024", lambda update: print(update))
        ```
    """

    def __init__(self, options: Optional[ClientOptions] = None):
        self.options = options or ClientOptions()
        self._http_client: Optional[httpx.AsyncClient] = None
        self._cache: Optional[MemoryCache[EAMPMetadata]] = None
        self._subscriptions: Set[str] = set()
        self._update_callbacks: Dict[str, List[Callable[[MetadataUpdate], None]]] = {}
        
        if self.options.cache_enabled:
            self._cache = MemoryCache[EAMPMetadata](ttl=self.options.cache_ttl)

    async def __aenter__(self):
        await self._ensure_http_client()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    async def get_metadata(self, resource_id: str) -> EAMPMetadata:
        """
        Get metadata for a specific resource
        
        Args:
            resource_id: Unique identifier for the resource
            
        Returns:
            EAMPMetadata object
            
        Raises:
            ResourceNotFoundError: If resource doesn't exist
            ValidationError: If response format is invalid
            NetworkError: If network request fails
        """
        if not resource_id:
            raise ValidationError("Resource ID is required")

        # Check cache first
        if self._cache:
            cached = self._cache.get(resource_id)
            if cached:
                logger.debug(f"Cache hit for resource: {resource_id}")
                return cached

        try:
            await self._ensure_http_client()
            
            url = f"/metadata/{quote(resource_id)}"
            response = await self._http_client.get(url)
            
            if response.status_code == 404:
                raise ResourceNotFoundError(f"Resource not found: {resource_id}")
            elif response.status_code == 401:
                raise AuthenticationError("Authentication required")
            elif response.status_code == 403:
                raise AuthorizationError("Access denied")
            elif response.status_code == 429:
                retry_after = response.headers.get("Retry-After")
                raise RateLimitError("Rate limit exceeded", retry_after=int(retry_after) if retry_after else None)
            elif response.status_code >= 500:
                raise ServerError(f"Server error: {response.status_code}", response.status_code)
            elif not response.is_success:
                # Try to parse error response
                try:
                    error_data = response.json()
                    error_model = EAMPErrorModel.parse_obj(error_data)
                    raise EAMPError(error_model.error["message"], code=error_model.error.get("code", "UNKNOWN"))
                except (json.JSONDecodeError, PydanticValidationError):
                    raise NetworkError(f"HTTP {response.status_code}: {response.text}")

            # Parse successful response
            data = response.json()
            metadata = EAMPMetadata.parse_obj(data)

            # Cache the result
            if self._cache:
                self._cache.set(resource_id, metadata)
                logger.debug(f"Cached metadata for resource: {resource_id}")

            return metadata

        except httpx.TimeoutException:
            raise TimeoutError(f"Request timeout after {self.options.timeout}s", self.options.timeout)
        except httpx.NetworkError as e:
            raise NetworkError(f"Network error: {str(e)}")
        except PydanticValidationError as e:
            raise ValidationError(f"Invalid metadata format: {str(e)}")

    async def list_metadata(self, filter_obj: Optional[MetadataFilter] = None) -> List[EAMPMetadata]:
        """
        List metadata with optional filtering
        
        Args:
            filter_obj: Optional filter criteria
            
        Returns:
            List of EAMPMetadata objects
        """
        await self._ensure_http_client()
        
        params = {}
        if filter_obj:
            if filter_obj.type:
                params["type"] = filter_obj.type.value
            if filter_obj.tags:
                params["tags"] = ",".join(filter_obj.tags)
            if filter_obj.accessibility_features:
                params["features"] = ",".join(filter_obj.accessibility_features)
            if filter_obj.created_after:
                params["createdAfter"] = filter_obj.created_after.isoformat()
            if filter_obj.created_before:
                params["createdBefore"] = filter_obj.created_before.isoformat()
            if filter_obj.has_data_points is not None:
                params["hasDataPoints"] = str(filter_obj.has_data_points).lower()
            if filter_obj.language:
                params["language"] = filter_obj.language

        try:
            response = await self._http_client.get("/metadata", params=params)
            response.raise_for_status()
            
            data = response.json()
            if not isinstance(data, list):
                raise ValidationError("Expected list of metadata objects")

            return [EAMPMetadata.parse_obj(item) for item in data]

        except httpx.HTTPStatusError as e:
            raise NetworkError(f"HTTP {e.response.status_code}: {e.response.text}")
        except PydanticValidationError as e:
            raise ValidationError(f"Invalid metadata format: {str(e)}")

    async def subscribe(self, resource_id: str, callback: Callable[[MetadataUpdate], None]) -> None:
        """
        Subscribe to real-time metadata updates for a resource
        
        Args:
            resource_id: Resource to monitor
            callback: Function to call when updates occur
        """
        if not resource_id:
            raise ValidationError("Resource ID is required")

        # Store callback
        if resource_id not in self._update_callbacks:
            self._update_callbacks[resource_id] = []
        self._update_callbacks[resource_id].append(callback)
        
        self._subscriptions.add(resource_id)
        logger.info(f"Subscribed to updates for resource: {resource_id}")

        # TODO: Implement WebSocket connection for real-time updates
        # This would involve connecting to a WebSocket endpoint and
        # setting up message handlers for update events

    async def unsubscribe(self, resource_id: str, callback: Optional[Callable[[MetadataUpdate], None]] = None) -> None:
        """
        Unsubscribe from metadata updates
        
        Args:
            resource_id: Resource to stop monitoring
            callback: Specific callback to remove (if None, removes all callbacks)
        """
        if resource_id in self._subscriptions:
            if callback and resource_id in self._update_callbacks:
                try:
                    self._update_callbacks[resource_id].remove(callback)
                    if not self._update_callbacks[resource_id]:
                        del self._update_callbacks[resource_id]
                        self._subscriptions.remove(resource_id)
                except ValueError:
                    pass
            else:
                # Remove all callbacks for this resource
                self._update_callbacks.pop(resource_id, None)
                self._subscriptions.remove(resource_id)
            
            logger.info(f"Unsubscribed from updates for resource: {resource_id}")

    async def unsubscribe_all(self) -> None:
        """Unsubscribe from all metadata updates"""
        self._subscriptions.clear()
        self._update_callbacks.clear()
        logger.info("Unsubscribed from all updates")

    async def refresh_metadata(self, resource_id: str) -> EAMPMetadata:
        """
        Refresh metadata for a resource (bypass cache)
        
        Args:
            resource_id: Resource to refresh
            
        Returns:
            Fresh EAMPMetadata object
        """
        # Clear from cache
        if self._cache:
            self._cache.delete(resource_id)
        
        return await self.get_metadata(resource_id)

    def is_subscribed(self, resource_id: str) -> bool:
        """Check if subscribed to a resource"""
        return resource_id in self._subscriptions

    def get_subscriptions(self) -> List[str]:
        """Get list of subscribed resource IDs"""
        return list(self._subscriptions)

    def clear_cache(self) -> None:
        """Clear all cached metadata"""
        if self._cache:
            self._cache.clear()
            logger.info("Cache cleared")

    def get_cache_stats(self) -> Optional[Dict[str, Any]]:
        """Get cache statistics"""
        return self._cache.get_stats() if self._cache else None

    async def close(self) -> None:
        """Close client and cleanup resources"""
        await self.unsubscribe_all()
        
        if self._http_client:
            await self._http_client.aclose()
            self._http_client = None
        
        if self._cache:
            self._cache.clear()

    async def _ensure_http_client(self) -> None:
        """Ensure HTTP client is initialized"""
        if not self._http_client:
            if not self.options.base_url:
                raise ValidationError("Base URL is required")
            
            headers = {
                "Accept": "application/eamp+json, application/json",
                "Content-Type": "application/json",
                **(self.options.headers or {})
            }
            
            if self.options.user_agent:
                headers["User-Agent"] = self.options.user_agent

            timeout = httpx.Timeout(self.options.timeout)
            
            self._http_client = httpx.AsyncClient(
                base_url=str(self.options.base_url),
                timeout=timeout,
                headers=headers,
                follow_redirects=True,
            )

    def _handle_update(self, resource_id: str, update: MetadataUpdate) -> None:
        """Handle incoming metadata update"""
        if resource_id in self._update_callbacks:
            for callback in self._update_callbacks[resource_id]:
                try:
                    callback(update)
                except Exception as e:
                    logger.error(f"Error in update callback for {resource_id}: {e}")

        # Update cache if we have new metadata
        if self._cache and update.metadata:
            self._cache.set(resource_id, update.metadata)