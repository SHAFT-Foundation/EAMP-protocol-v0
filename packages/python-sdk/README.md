# EAMP Python SDK

The official Python SDK for the Extended Accessibility Metadata Protocol (EAMP).

## Installation

```bash
pip install eamp-python-sdk
# or
poetry add eamp-python-sdk
# or
pipenv install eamp-python-sdk
```

## Quick Start

### Client Usage

```python
import asyncio
from eamp import EAMPClient

async def main():
    client = EAMPClient()
    
    # Get metadata for a resource
    metadata = await client.get_metadata("https://example.com/chart.png")
    print(f"Alt text: {metadata.short_alt}")
    print(f"Description: {metadata.extended_description}")
    
    # Subscribe to updates
    async def handle_update(update):
        print(f"Metadata updated: {update}")
    
    await client.subscribe("https://example.com/chart.png", handle_update)

if __name__ == "__main__":
    asyncio.run(main())
```

### Server Usage

```python
from eamp import EAMPServer, EAMPMetadata, DataPoint
from fastapi import FastAPI
import uvicorn

# Create EAMP server
server = EAMPServer(
    name="MyApp Accessibility Server",
    version="1.0.0",
    description="Accessibility metadata for MyApp"
)

# Register metadata provider
@server.metadata_provider
async def get_metadata(resource_id: str) -> EAMPMetadata:
    # Fetch your data (from database, API, etc.)
    if resource_id == "sales-chart-2024":
        return EAMPMetadata(
            id=resource_id,
            type="image",
            short_alt="Quarterly sales chart for 2024",
            extended_description="Bar chart showing steady growth...",
            data_points=[
                DataPoint(label="Q1", value=1200000, unit="USD"),
                DataPoint(label="Q2", value=1500000, unit="USD"),
                DataPoint(label="Q3", value=1900000, unit="USD"),
                DataPoint(label="Q4", value=2300000, unit="USD"),
            ],
            accessibility_features=["high-contrast", "screen-reader-optimized"],
            tags=["finance", "sales", "2024"]
        )
    return None

# Create FastAPI app and mount EAMP server
app = FastAPI()
server.mount(app, prefix="/eamp")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## Features

- ✅ Full EAMP v1.0 protocol support
- ✅ Type hints and validation with Pydantic
- ✅ Async/await support
- ✅ Multiple transport layers (HTTP, WebSocket)
- ✅ Real-time metadata updates
- ✅ Built-in validation and serialization
- ✅ Caching and performance optimization
- ✅ Error handling and retry logic
- ✅ Web3 integration (IPFS via py-ipfs-http-client)
- ✅ FastAPI and Django integration

## API Reference

### EAMPClient

#### Constructor

```python
EAMPClient(
    base_url: str = None,
    timeout: int = 30,
    retry_attempts: int = 3,
    cache_enabled: bool = True,
    cache_ttl: int = 300,
    user_agent: str = None
)
```

#### Methods

```python
async def get_metadata(self, resource_id: str) -> Optional[EAMPMetadata]:
    """Get metadata for a specific resource."""

async def list_metadata(self, filter: Optional[MetadataFilter] = None) -> List[EAMPMetadata]:
    """List available metadata with optional filtering."""

async def subscribe(self, resource_id: str, callback: Callable[[MetadataUpdate], None]) -> None:
    """Subscribe to metadata updates for a resource."""

async def unsubscribe(self, resource_id: str) -> None:
    """Unsubscribe from metadata updates."""
```

### EAMPServer

#### Constructor

```python
EAMPServer(
    name: str,
    version: str,
    description: str = None,
    capabilities: Optional[ServerCapabilities] = None
)
```

#### Methods

```python
def metadata_provider(self, func: Callable[[str], Awaitable[Optional[EAMPMetadata]]]) -> None:
    """Decorator to register metadata provider function."""

def mount(self, app: FastAPI, prefix: str = "/eamp") -> None:
    """Mount server on FastAPI application."""

async def notify_metadata_changed(self, resource_id: str) -> None:
    """Notify subscribers of metadata changes."""
```

## Data Models

All data models use Pydantic for validation and serialization:

```python
from eamp.models import EAMPMetadata, DataPoint, Scene
from typing import List, Optional
from enum import Enum

class ContentType(str, Enum):
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    UI_ELEMENT = "ui-element"
    DOCUMENT = "document"

class EAMPMetadata(BaseModel):
    id: str
    type: ContentType
    eamp_version: str = "1.0.0"
    short_alt: str = Field(..., max_length=250)
    extended_description: str = Field(..., min_length=1)
    data_points: Optional[List[DataPoint]] = None
    transcript: Optional[str] = None
    scenes: Optional[List[Scene]] = None
    accessibility_features: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    source_attribution: Optional[str] = None
    metadata_uri: Optional[str] = None

class DataPoint(BaseModel):
    label: str
    value: Union[str, int, float, bool]
    unit: Optional[str] = None

class Scene(BaseModel):
    time: str
    description: str
```

## Examples

### Django Integration

```python
# views.py
from django.http import JsonResponse
from django.views import View
from eamp import EAMPMetadata
import json

class EAMPMetadataView(View):
    async def get(self, request, resource_id):
        try:
            # Get metadata from your Django models
            metadata = await self.get_accessibility_metadata(resource_id)
            if metadata:
                return JsonResponse(metadata.dict())
            else:
                return JsonResponse({"error": "Resource not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    async def get_accessibility_metadata(self, resource_id: str) -> Optional[EAMPMetadata]:
        # Your implementation here
        pass

# urls.py  
from django.urls import path
from . import views

urlpatterns = [
    path('eamp/metadata/<str:resource_id>/', views.EAMPMetadataView.as_view()),
]
```

### Flask Integration

```python
from flask import Flask, jsonify, request
from eamp import EAMPMetadata, EAMPServer
import asyncio

app = Flask(__name__)
eamp_server = EAMPServer(name="Flask EAMP Server", version="1.0.0")

@eamp_server.metadata_provider
async def get_metadata(resource_id: str) -> Optional[EAMPMetadata]:
    # Your metadata logic here
    return EAMPMetadata(
        id=resource_id,
        type="image",
        short_alt=f"Metadata for {resource_id}",
        extended_description=f"Detailed description for {resource_id}"
    )

@app.route('/eamp/metadata/<resource_id>')
def get_accessibility_metadata(resource_id):
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        metadata = loop.run_until_complete(get_metadata(resource_id))
        if metadata:
            return jsonify(metadata.dict())
        else:
            return jsonify({"error": "Resource not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

### Database Integration

```python
from sqlalchemy import create_engine, Column, String, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from eamp import EAMPMetadata, DataPoint

Base = declarative_base()

class AccessibilityMetadata(Base):
    __tablename__ = "accessibility_metadata"
    
    resource_id = Column(String, primary_key=True)
    content_type = Column(String, nullable=False)
    short_alt = Column(String(250), nullable=False)
    extended_description = Column(Text, nullable=False)
    data_points = Column(JSON)
    accessibility_features = Column(JSON)
    tags = Column(JSON)

@eamp_server.metadata_provider
async def get_metadata_from_db(resource_id: str) -> Optional[EAMPMetadata]:
    session = SessionLocal()
    try:
        db_metadata = session.query(AccessibilityMetadata).filter(
            AccessibilityMetadata.resource_id == resource_id
        ).first()
        
        if not db_metadata:
            return None
            
        return EAMPMetadata(
            id=db_metadata.resource_id,
            type=db_metadata.content_type,
            short_alt=db_metadata.short_alt,
            extended_description=db_metadata.extended_description,
            data_points=[
                DataPoint(**dp) for dp in (db_metadata.data_points or [])
            ],
            accessibility_features=db_metadata.accessibility_features,
            tags=db_metadata.tags
        )
    finally:
        session.close()
```

### Web3 Integration

```python
from eamp.web3 import IPFSClient
import json

# Store metadata on IPFS
ipfs_client = IPFSClient()

metadata = EAMPMetadata(
    id="nft-artwork-001",
    type="image", 
    short_alt="Digital artwork of a sunset",
    extended_description="Vibrant digital painting featuring a sunset...",
    source_attribution="Artist: Jane Doe (2024)",
)

# Upload to IPFS
ipfs_hash = await ipfs_client.upload_json(metadata.dict())
print(f"Metadata stored at: ipfs://{ipfs_hash}")

# Smart contract integration (using web3.py)
from web3 import Web3

contract_abi = [
    {
        "inputs": [],
        "name": "accessibilityMetadataURI", 
        "outputs": [{"type": "string"}],
        "stateMutability": "view",
        "type": "function"
    }
]

w3 = Web3(Web3.HTTPProvider('https://mainnet.infura.io/v3/YOUR-KEY'))
contract = w3.eth.contract(address="0x...", abi=contract_abi)

# Get metadata URI from contract
metadata_uri = contract.functions.accessibilityMetadataURI().call()
if metadata_uri.startswith('ipfs://'):
    ipfs_hash = metadata_uri[7:]  # Remove 'ipfs://' prefix
    metadata = await ipfs_client.get_json(ipfs_hash)
```

## Configuration

### Environment Variables

```bash
# Client configuration
EAMP_BASE_URL=https://api.example.com
EAMP_TIMEOUT=30
EAMP_RETRY_ATTEMPTS=3
EAMP_CACHE_ENABLED=true
EAMP_CACHE_TTL=300

# Server configuration  
EAMP_SERVER_NAME="MyApp EAMP Server"
EAMP_SERVER_VERSION=1.0.0
EAMP_REAL_TIME_UPDATES=true

# IPFS configuration
IPFS_NODE_URL=http://localhost:5001
IPFS_TIMEOUT=30
```

### Configuration File

```python
# config.py
from pydantic import BaseSettings

class EAMPSettings(BaseSettings):
    base_url: str = "https://api.example.com"
    timeout: int = 30
    retry_attempts: int = 3
    cache_enabled: bool = True
    cache_ttl: int = 300
    
    class Config:
        env_prefix = "EAMP_"

settings = EAMPSettings()
client = EAMPClient(**settings.dict())
```

## Error Handling

```python
from eamp.exceptions import (
    EAMPError,
    ResourceNotFoundError,
    ValidationError,
    NetworkError
)

try:
    metadata = await client.get_metadata("invalid-resource")
except ResourceNotFoundError:
    print("Resource metadata not found")
except ValidationError as e:
    print(f"Invalid metadata format: {e}")
except NetworkError as e:
    print(f"Network error: {e}")
except EAMPError as e:
    print(f"EAMP error: {e.code} - {e.message}")
```

## Testing

```python
import pytest
from unittest.mock import AsyncMock
from eamp import EAMPClient, EAMPMetadata
from eamp.testing import MockEAMPClient

@pytest.fixture
def mock_client():
    client = MockEAMPClient()
    client.add_metadata("test-resource", EAMPMetadata(
        id="test-resource",
        type="image",
        short_alt="Test alt text",
        extended_description="Test description"
    ))
    return client

@pytest.mark.asyncio
async def test_get_metadata(mock_client):
    metadata = await mock_client.get_metadata("test-resource")
    assert metadata is not None
    assert metadata.short_alt == "Test alt text"

# Integration testing
@pytest.mark.asyncio
async def test_server_integration():
    from eamp.testing import EAMPTestServer
    
    server = EAMPTestServer()
    
    @server.metadata_provider
    async def provider(resource_id: str):
        return EAMPMetadata(
            id=resource_id,
            type="image", 
            short_alt="Test image",
            extended_description="Test description"
        )
    
    async with server:
        client = EAMPClient(base_url=server.url)
        metadata = await client.get_metadata("test")
        assert metadata.short_alt == "Test image"
```

## Performance Optimization

### Caching

```python
from eamp.cache import RedisCache
import redis

# Use Redis for caching
redis_client = redis.Redis(host='localhost', port=6379, db=0)
cache = RedisCache(redis_client, ttl=300)

client = EAMPClient(cache=cache)
```

### Connection Pooling

```python
import aiohttp
from eamp import EAMPClient

# Custom session with connection pooling
connector = aiohttp.TCPConnector(limit=100, limit_per_host=30)
session = aiohttp.ClientSession(connector=connector)

client = EAMPClient(session=session)
```

## Contributing

See the main [Contributing Guide](../../CONTRIBUTING.md) for details.

## License

MIT - see [LICENSE](../../LICENSE) for details.

---

Built with ❤️ by [Shaft Finance](https://shaft.finance) for accessible Python applications.