"""
EAMP Python SDK utilities
"""

import time
from typing import Any, Dict, Generic, Optional, TypeVar
from threading import RLock
from pydantic import ValidationError as PydanticValidationError

from .models import EAMPMetadata, MetadataFilter
from .exceptions import ValidationError

T = TypeVar('T')


class MemoryCache(Generic[T]):
    """Thread-safe in-memory cache with TTL support"""
    
    def __init__(self, ttl: int = 300):
        """
        Initialize cache
        
        Args:
            ttl: Time-to-live in seconds (default 5 minutes)
        """
        self.ttl = ttl
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._lock = RLock()
    
    def get(self, key: str) -> Optional[T]:
        """Get value from cache"""
        with self._lock:
            entry = self._cache.get(key)
            if not entry:
                return None
            
            if time.time() > entry['expires_at']:
                del self._cache[key]
                return None
            
            entry['access_count'] += 1
            entry['last_accessed'] = time.time()
            return entry['value']
    
    def set(self, key: str, value: T, custom_ttl: Optional[int] = None) -> None:
        """Set value in cache"""
        ttl = custom_ttl if custom_ttl is not None else self.ttl
        expires_at = time.time() + ttl
        
        with self._lock:
            self._cache[key] = {
                'value': value,
                'expires_at': expires_at,
                'created_at': time.time(),
                'last_accessed': time.time(),
                'access_count': 0,
            }
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        with self._lock:
            return self._cache.pop(key, None) is not None
    
    def clear(self) -> None:
        """Clear all cached values"""
        with self._lock:
            self._cache.clear()
    
    def has(self, key: str) -> bool:
        """Check if key exists and is not expired"""
        return self.get(key) is not None
    
    def cleanup(self) -> int:
        """Remove expired entries and return count of removed items"""
        current_time = time.time()
        removed_count = 0
        
        with self._lock:
            expired_keys = [
                key for key, entry in self._cache.items()
                if current_time > entry['expires_at']
            ]
            
            for key in expired_keys:
                del self._cache[key]
                removed_count += 1
        
        return removed_count
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        with self._lock:
            current_time = time.time()
            entries = list(self._cache.values())
            
            expired_count = sum(1 for entry in entries if current_time > entry['expires_at'])
            active_count = len(entries) - expired_count
            total_access_count = sum(entry['access_count'] for entry in entries)
            
            return {
                'total_entries': len(self._cache),
                'active_entries': active_count,
                'expired_entries': expired_count,
                'total_access_count': total_access_count,
                'hit_rate': self._calculate_hit_rate(entries),
                'memory_estimate': self._estimate_memory_usage(),
            }
    
    def keys(self) -> List[str]:
        """Get all keys in cache"""
        with self._lock:
            return list(self._cache.keys())
    
    def size(self) -> int:
        """Get cache size"""
        with self._lock:
            return len(self._cache)
    
    def _calculate_hit_rate(self, entries: List[Dict[str, Any]]) -> float:
        """Calculate approximate hit rate"""
        if not entries:
            return 0.0
        
        total_accesses = sum(entry['access_count'] for entry in entries)
        unique_keys = len(entries)
        
        # Rough estimation: assumes each key was requested at least once
        return unique_keys / (total_accesses + unique_keys) if (total_accesses + unique_keys) > 0 else 0.0
    
    def _estimate_memory_usage(self) -> int:
        """Estimate memory usage in bytes (rough calculation)"""
        # This is a very rough estimation
        import sys
        total_size = 0
        
        with self._lock:
            for key, entry in self._cache.items():
                total_size += sys.getsizeof(key)
                total_size += sys.getsizeof(entry['value'])
                total_size += sys.getsizeof(entry)  # Dictionary overhead
        
        return total_size


def validate_metadata(data: Any) -> EAMPMetadata:
    """
    Validate data against EAMP metadata schema
    
    Args:
        data: Data to validate
        
    Returns:
        Validated EAMPMetadata object
        
    Raises:
        ValidationError: If data is invalid
    """
    try:
        return EAMPMetadata.parse_obj(data)
    except PydanticValidationError as e:
        raise ValidationError(f"Invalid metadata: {str(e)}")


def validate_filter(data: Any) -> MetadataFilter:
    """
    Validate data against metadata filter schema
    
    Args:
        data: Data to validate
        
    Returns:
        Validated MetadataFilter object
        
    Raises:
        ValidationError: If data is invalid
    """
    try:
        return MetadataFilter.parse_obj(data)
    except PydanticValidationError as e:
        raise ValidationError(f"Invalid filter: {str(e)}")


def format_accessibility_description(metadata: EAMPMetadata, verbose: bool = False) -> str:
    """
    Format accessibility description for screen readers
    
    Args:
        metadata: EAMP metadata object
        verbose: Whether to include extended information
        
    Returns:
        Formatted description string
    """
    parts = [metadata.short_alt]
    
    if verbose and metadata.extended_description:
        parts.append(metadata.extended_description)
    
    if verbose and metadata.data_points:
        data_summary = f"Contains {len(metadata.data_points)} data points: "
        point_descriptions = []
        for point in metadata.data_points[:5]:  # Limit to first 5 points
            unit_str = f" {point.unit}" if point.unit else ""
            point_descriptions.append(f"{point.label}: {point.value}{unit_str}")
        
        if len(metadata.data_points) > 5:
            point_descriptions.append("and more")
        
        data_summary += ", ".join(point_descriptions)
        parts.append(data_summary)
    
    if metadata.accessibility_features:
        features_str = f"Accessibility features: {', '.join(metadata.accessibility_features)}"
        parts.append(features_str)
    
    return ". ".join(parts) + "."


def extract_multilingual_field(metadata: EAMPMetadata, field_name: str, language: str = "en") -> Optional[str]:
    """
    Extract multilingual field value for specific language
    
    Args:
        metadata: EAMP metadata object
        field_name: Field name (e.g., 'short_alt', 'extended_description')
        language: Language code (BCP 47)
        
    Returns:
        Field value for specified language or None
    """
    # Try language-specific field first
    lang_field = f"{field_name}_{language}"
    if hasattr(metadata, lang_field):
        return getattr(metadata, lang_field)
    
    # Fall back to base field
    if hasattr(metadata, field_name):
        return getattr(metadata, field_name)
    
    return None


def build_query_params(filter_obj: MetadataFilter) -> Dict[str, str]:
    """
    Build query parameters from metadata filter
    
    Args:
        filter_obj: Metadata filter object
        
    Returns:
        Dictionary of query parameters
    """
    params = {}
    
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
    
    return params