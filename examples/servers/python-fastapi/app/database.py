"""Database configuration and models for EAMP FastAPI server."""

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any

import aiosqlite
from pydantic import ValidationError

from app.config import settings
from eamp.models import EAMPMetadata


class DatabaseManager:
    """Database manager for EAMP metadata."""
    
    def __init__(self, db_path: Optional[str] = None):
        if db_path:
            self.db_path = db_path
        else:
            # Extract path from SQLite URL
            db_url = settings.database.url
            if db_url.startswith("sqlite+aiosqlite:///"):
                self.db_path = db_url.replace("sqlite+aiosqlite:///", "")
            else:
                self.db_path = "./data/eamp.db"
        
        # Ensure data directory exists
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
    
    async def initialize(self) -> None:
        """Initialize the database with required tables."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """
                CREATE TABLE IF NOT EXISTS metadata (
                    id TEXT PRIMARY KEY,
                    type TEXT NOT NULL,
                    eamp_version TEXT NOT NULL DEFAULT '1.0.0',
                    short_alt TEXT NOT NULL,
                    extended_description TEXT,
                    data_points TEXT, -- JSON
                    visual_elements TEXT, -- JSON
                    accessibility_features TEXT, -- JSON
                    tags TEXT, -- JSON
                    context TEXT, -- JSON
                    transcript TEXT,
                    scenes TEXT, -- JSON
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            
            # Create indexes for better query performance
            await db.execute(
                "CREATE INDEX IF NOT EXISTS idx_metadata_type ON metadata(type)"
            )
            await db.execute(
                "CREATE INDEX IF NOT EXISTS idx_metadata_updated_at ON metadata(updated_at)"
            )
            
            await db.commit()
    
    async def create_metadata(self, metadata: EAMPMetadata) -> Dict[str, Any]:
        """Create new metadata record."""
        async with aiosqlite.connect(self.db_path) as db:
            now = datetime.utcnow().isoformat()
            
            await db.execute(
                """
                INSERT INTO metadata (
                    id, type, eamp_version, short_alt, extended_description,
                    data_points, visual_elements, accessibility_features,
                    tags, context, transcript, scenes, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    metadata.id,
                    metadata.type,
                    metadata.eamp_version,
                    metadata.short_alt,
                    metadata.extended_description,
                    json.dumps([dp.model_dump() for dp in metadata.data_points]) if metadata.data_points else None,
                    json.dumps([ve.model_dump() for ve in metadata.visual_elements]) if metadata.visual_elements else None,
                    json.dumps(metadata.accessibility_features) if metadata.accessibility_features else None,
                    json.dumps(metadata.tags) if metadata.tags else None,
                    json.dumps(metadata.context.model_dump()) if metadata.context else None,
                    metadata.transcript,
                    json.dumps([s.model_dump() for s in metadata.scenes]) if metadata.scenes else None,
                    now,
                    now,
                ),
            )
            await db.commit()
            
            # Return the created record with timestamps
            return await self.get_metadata(metadata.id)
    
    async def get_metadata(self, resource_id: str) -> Optional[Dict[str, Any]]:
        """Get metadata by resource ID."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                "SELECT * FROM metadata WHERE id = ?", (resource_id,)
            )
            row = await cursor.fetchone()
            
            if not row:
                return None
            
            return self._row_to_dict(row)
    
    async def list_metadata(
        self, 
        type_filter: Optional[str] = None,
        tags: Optional[List[str]] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """List metadata with optional filtering."""
        query = "SELECT * FROM metadata WHERE 1=1"
        params = []
        
        if type_filter:
            query += " AND type = ?"
            params.append(type_filter)
        
        if tags:
            # Simple tag filtering - check if any tag is in the JSON array
            tag_conditions = []
            for tag in tags:
                tag_conditions.append("JSON_EXTRACT(tags, '$') LIKE ?")
                params.append(f"%{tag}%")
            
            if tag_conditions:
                query += f" AND ({' OR '.join(tag_conditions)})"
        
        query += " ORDER BY updated_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(query, params)
            rows = await cursor.fetchall()
            
            return [self._row_to_dict(row) for row in rows]
    
    async def update_metadata(
        self, resource_id: str, updates: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Update existing metadata record."""
        # First check if record exists
        existing = await self.get_metadata(resource_id)
        if not existing:
            return None
        
        # Build update query dynamically
        set_clauses = []
        params = []
        
        allowed_fields = {
            "type", "eamp_version", "short_alt", "extended_description",
            "data_points", "visual_elements", "accessibility_features",
            "tags", "context", "transcript", "scenes"
        }
        
        for field, value in updates.items():
            if field not in allowed_fields:
                continue
            
            set_clauses.append(f"{field} = ?")
            
            # Handle JSON fields
            if field in {"data_points", "visual_elements", "scenes"}:
                if value is not None:
                    # Assuming value is already a list of model instances or dicts
                    if hasattr(value[0], 'model_dump') if value else False:
                        params.append(json.dumps([item.model_dump() for item in value]))
                    else:
                        params.append(json.dumps(value))
                else:
                    params.append(None)
            elif field in {"accessibility_features", "tags"}:
                params.append(json.dumps(value) if value else None)
            elif field == "context" and value is not None:
                if hasattr(value, 'model_dump'):
                    params.append(json.dumps(value.model_dump()))
                else:
                    params.append(json.dumps(value))
            else:
                params.append(value)
        
        if not set_clauses:
            return existing
        
        # Add updated_at
        set_clauses.append("updated_at = ?")
        params.append(datetime.utcnow().isoformat())
        params.append(resource_id)
        
        query = f"UPDATE metadata SET {', '.join(set_clauses)} WHERE id = ?"
        
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(query, params)
            await db.commit()
        
        return await self.get_metadata(resource_id)
    
    async def delete_metadata(self, resource_id: str) -> bool:
        """Delete metadata record."""
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute(
                "DELETE FROM metadata WHERE id = ?", (resource_id,)
            )
            await db.commit()
            return cursor.rowcount > 0
    
    async def get_stats(self) -> Dict[str, Any]:
        """Get database statistics."""
        async with aiosqlite.connect(self.db_path) as db:
            # Total count
            cursor = await db.execute("SELECT COUNT(*) FROM metadata")
            total_count = (await cursor.fetchone())[0]
            
            # Count by type
            cursor = await db.execute(
                "SELECT type, COUNT(*) FROM metadata GROUP BY type"
            )
            type_counts = {row[0]: row[1] for row in await cursor.fetchall()}
            
            return {
                "total_count": total_count,
                "by_type": type_counts,
            }
    
    def _row_to_dict(self, row: aiosqlite.Row) -> Dict[str, Any]:
        """Convert database row to dictionary."""
        result = dict(row)
        
        # Parse JSON fields
        json_fields = {
            "data_points", "visual_elements", "accessibility_features",
            "tags", "context", "scenes"
        }
        
        for field in json_fields:
            if result.get(field):
                try:
                    result[field] = json.loads(result[field])
                except json.JSONDecodeError:
                    result[field] = None
        
        return result
    
    async def close(self) -> None:
        """Close database connections. (No-op for aiosqlite)"""
        pass


# Global database instance
db = DatabaseManager()