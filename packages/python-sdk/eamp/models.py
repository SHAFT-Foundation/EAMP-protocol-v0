"""
EAMP data models using Pydantic for validation and serialization.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, HttpUrl, validator, root_validator


class ContentType(str, Enum):
    """EAMP content types"""
    IMAGE = "image"
    VIDEO = "video" 
    AUDIO = "audio"
    UI_ELEMENT = "ui-element"
    DOCUMENT = "document"


class DataPoint(BaseModel):
    """Data point for charts and structured data"""
    label: str = Field(..., min_length=1, description="Human-readable label")
    value: Union[str, int, float, bool] = Field(..., description="The data value")
    unit: Optional[str] = Field(None, description="Unit of measurement")
    category: Optional[str] = Field(None, description="Data category or group")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

    class Config:
        schema_extra = {
            "example": {
                "label": "Q1 Sales",
                "value": 1200000,
                "unit": "USD",
                "category": "quarterly"
            }
        }


class Scene(BaseModel):
    """Scene description for video/audio content"""
    time: str = Field(
        ..., 
        regex=r"^\d{1,2}:\d{2}(:\d{2})?(-\d{1,2}:\d{2}(:\d{2})?)?$",
        description="Time range in MM:SS or HH:MM:SS format"
    )
    description: str = Field(..., min_length=1, description="Scene description")
    speakers: Optional[List[str]] = Field(None, description="Active speakers")
    visual_elements: Optional[List[str]] = Field(None, description="Visual elements")
    audio_elements: Optional[List[str]] = Field(None, description="Audio elements")

    class Config:
        schema_extra = {
            "example": {
                "time": "0:30-1:15",
                "description": "Chef mixing ingredients in bowl",
                "speakers": ["Chef Maria"],
                "visual_elements": ["mixing bowl", "ingredients"],
                "audio_elements": ["mixing sounds", "narration"]
            }
        }


class VisualElementType(str, Enum):
    """Visual element types"""
    TEXT = "text"
    SHAPE = "shape"
    COLOR = "color"
    PATTERN = "pattern"
    ICON = "icon"
    CHART = "chart"
    GRAPH = "graph"
    MAP = "map"
    PHOTO = "photo"
    ILLUSTRATION = "illustration"


class ElementSize(str, Enum):
    """Element sizes"""
    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"


class VisualElement(BaseModel):
    """Visual element in images"""
    type: VisualElementType = Field(..., description="Type of visual element")
    description: str = Field(..., min_length=1, description="Element description")
    position: Optional[str] = Field(None, description="Position in image")
    color: Optional[str] = Field(None, description="Primary color")
    size: Optional[ElementSize] = Field(None, description="Relative size")

    class Config:
        schema_extra = {
            "example": {
                "type": "chart",
                "description": "Blue bar chart showing sales data",
                "position": "center",
                "color": "blue",
                "size": "large"
            }
        }


class Context(BaseModel):
    """Contextual information about content"""
    page_title: Optional[str] = Field(None, description="Page title")
    section_heading: Optional[str] = Field(None, description="Section heading")
    surrounding_text: Optional[str] = Field(None, description="Surrounding text")
    purpose: Optional[str] = Field(None, description="Content purpose")
    user_task: Optional[str] = Field(None, description="Supported user task")
    related_elements: Optional[List[str]] = Field(None, description="Related element IDs")

    class Config:
        schema_extra = {
            "example": {
                "page_title": "Q4 Financial Report",
                "section_heading": "Sales Performance",
                "purpose": "Illustrate quarterly sales growth"
            }
        }


class EAMPMetadata(BaseModel):
    """Core EAMP metadata model"""
    id: str = Field(..., min_length=1, description="Unique resource identifier")
    type: ContentType = Field(..., description="Content type")
    eamp_version: str = Field("1.0.0", regex=r"^\d+\.\d+\.\d+$", description="EAMP version")
    short_alt: str = Field(
        ..., 
        min_length=1, 
        max_length=250,
        description="Concise alternative text"
    )
    extended_description: str = Field(
        ..., 
        min_length=1,
        description="Detailed accessibility description"
    )
    data_points: Optional[List[DataPoint]] = Field(None, description="Structured data")
    transcript: Optional[str] = Field(None, description="Full transcript")
    scenes: Optional[List[Scene]] = Field(None, description="Scene descriptions")
    visual_elements: Optional[List[VisualElement]] = Field(None, description="Visual elements")
    accessibility_features: Optional[List[str]] = Field(None, description="Accessibility features")
    tags: Optional[List[str]] = Field(None, description="Content tags")
    source_attribution: Optional[str] = Field(None, description="Source attribution")
    metadata_uri: Optional[HttpUrl] = Field(None, description="Metadata URI")
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Update timestamp")
    expires_at: Optional[datetime] = Field(None, description="Expiration timestamp")
    context: Optional[Context] = Field(None, description="Content context")

    class Config:
        schema_extra = {
            "example": {
                "id": "sales-chart-2024",
                "type": "image",
                "short_alt": "Quarterly sales chart for 2024",
                "extended_description": "Bar chart showing steady growth from Q1 to Q4...",
                "data_points": [
                    {"label": "Q1", "value": 1200000, "unit": "USD"},
                    {"label": "Q2", "value": 1500000, "unit": "USD"}
                ],
                "accessibility_features": ["high-contrast", "screen-reader-optimized"],
                "tags": ["finance", "sales", "2024"]
            }
        }

    @validator('accessibility_features', each_item=True)
    def validate_accessibility_features(cls, feature):
        """Validate accessibility features"""
        valid_features = {
            'high-contrast', 'screen-reader-optimized', 'keyboard-accessible',
            'touch-friendly', 'voice-navigable', 'color-blind-friendly',
            'motion-reduced', 'captions-available', 'audio-descriptions',
            'sign-language'
        }
        if feature not in valid_features:
            # Allow custom features but issue warning
            pass
        return feature


class EAMPError(BaseModel):
    """EAMP error response"""
    error: Dict[str, Any] = Field(..., description="Error details")

    class Config:
        schema_extra = {
            "example": {
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "shortAlt exceeds 250 characters",
                    "field": "short_alt"
                }
            }
        }


class MetadataFilter(BaseModel):
    """Filter for querying metadata"""
    type: Optional[ContentType] = Field(None, description="Content type filter")
    tags: Optional[List[str]] = Field(None, description="Tag filters")
    accessibility_features: Optional[List[str]] = Field(None, description="Feature filters")
    created_after: Optional[datetime] = Field(None, description="Created after timestamp")
    created_before: Optional[datetime] = Field(None, description="Created before timestamp")
    has_data_points: Optional[bool] = Field(None, description="Has data points")
    language: Optional[str] = Field(None, description="Language code")

    class Config:
        schema_extra = {
            "example": {
                "type": "image",
                "tags": ["finance", "charts"],
                "accessibility_features": ["high-contrast"],
                "has_data_points": True
            }
        }


class MetadataUpdate(BaseModel):
    """Metadata update event"""
    resource_id: str = Field(..., description="Resource identifier")
    change_type: str = Field(..., description="Type of change")
    timestamp: datetime = Field(..., description="Update timestamp")
    metadata: Optional[EAMPMetadata] = Field(None, description="Updated metadata")

    @validator('change_type')
    def validate_change_type(cls, change_type):
        valid_types = {'created', 'updated', 'deleted', 'data_updated'}
        if change_type not in valid_types:
            raise ValueError(f'change_type must be one of {valid_types}')
        return change_type


class ClientOptions(BaseModel):
    """Client configuration options"""
    base_url: Optional[HttpUrl] = Field(None, description="Base URL for API")
    timeout: int = Field(30, gt=0, description="Request timeout in seconds")
    retry_attempts: int = Field(3, ge=0, description="Retry attempts")
    cache_enabled: bool = Field(True, description="Enable caching")
    cache_ttl: int = Field(300, gt=0, description="Cache TTL in seconds")
    user_agent: Optional[str] = Field(None, description="User agent string")
    headers: Optional[Dict[str, str]] = Field(None, description="Custom headers")

    class Config:
        schema_extra = {
            "example": {
                "base_url": "https://api.example.com",
                "timeout": 30,
                "cache_enabled": True,
                "headers": {"Authorization": "Bearer token"}
            }
        }


class ServerCapabilities(BaseModel):
    """Server capability flags"""
    real_time_updates: bool = Field(False, description="Supports real-time updates")
    data_points: bool = Field(True, description="Supports data points")
    multi_language: bool = Field(False, description="Supports multiple languages")
    web3_support: bool = Field(False, description="Supports Web3 features")


class ServerInfo(BaseModel):
    """Server information"""
    name: str = Field(..., description="Server name")
    version: str = Field(..., description="Server version")
    description: Optional[str] = Field(None, description="Server description")
    capabilities: Optional[ServerCapabilities] = Field(None, description="Server capabilities")

    class Config:
        schema_extra = {
            "example": {
                "name": "MyApp EAMP Server",
                "version": "1.0.0",
                "description": "Accessibility metadata server",
                "capabilities": {
                    "real_time_updates": True,
                    "data_points": True
                }
            }
        }