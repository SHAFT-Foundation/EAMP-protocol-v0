import Database from 'better-sqlite3';
import { resolve, dirname } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { EAMPMetadata, ContentType } from '@eamp/javascript-sdk';
import config from '../config/index.js';
import logger from '../utils/logger.js';

export interface DatabaseMetadata extends EAMPMetadata {
  created_at: string;
  updated_at: string;
}

export interface MetadataFilter {
  type?: ContentType;
  tags?: string[];
  accessibilityFeatures?: string[];
  createdAfter?: string;
  createdBefore?: string;
  hasDataPoints?: boolean;
  language?: string;
  limit?: number;
  offset?: number;
}

export class MetadataDatabase {
  private db: Database.Database;

  constructor(dbPath: string = config.database.path) {
    // Ensure directory exists
    const dir = dirname(dbPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.initialize();
    logger.info(`Database initialized at ${dbPath}`);
  }

  private initialize(): void {
    // Create metadata table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS metadata (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        eamp_version TEXT NOT NULL DEFAULT '1.0.0',
        short_alt TEXT NOT NULL,
        extended_description TEXT NOT NULL,
        data_points TEXT, -- JSON
        transcript TEXT,
        scenes TEXT, -- JSON
        visual_elements TEXT, -- JSON
        accessibility_features TEXT, -- JSON array
        tags TEXT, -- JSON array
        source_attribution TEXT,
        metadata_uri TEXT,
        context TEXT, -- JSON
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME
      )
    `);

    // Create indexes for common queries
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_metadata_type ON metadata(type);
      CREATE INDEX IF NOT EXISTS idx_metadata_created_at ON metadata(created_at);
      CREATE INDEX IF NOT EXISTS idx_metadata_tags ON metadata(tags);
    `);

    // Create trigger to update updated_at
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_metadata_timestamp 
      AFTER UPDATE ON metadata
      FOR EACH ROW
      BEGIN
        UPDATE metadata SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);
  }

  async getMetadata(id: string): Promise<DatabaseMetadata | null> {
    const stmt = this.db.prepare('SELECT * FROM metadata WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) {
      return null;
    }

    return this.deserializeMetadata(row);
  }

  async listMetadata(filter: MetadataFilter = {}): Promise<DatabaseMetadata[]> {
    let query = 'SELECT * FROM metadata WHERE 1=1';
    const params: any[] = [];

    // Build WHERE clauses
    if (filter.type) {
      query += ' AND type = ?';
      params.push(filter.type);
    }

    if (filter.createdAfter) {
      query += ' AND created_at >= ?';
      params.push(filter.createdAfter);
    }

    if (filter.createdBefore) {
      query += ' AND created_at <= ?';
      params.push(filter.createdBefore);
    }

    if (filter.hasDataPoints !== undefined) {
      if (filter.hasDataPoints) {
        query += ' AND data_points IS NOT NULL AND data_points != "null"';
      } else {
        query += ' AND (data_points IS NULL OR data_points = "null")';
      }
    }

    if (filter.tags && filter.tags.length > 0) {
      const tagConditions = filter.tags.map(() => 'tags LIKE ?').join(' OR ');
      query += ` AND (${tagConditions})`;
      filter.tags.forEach(tag => {
        params.push(`%"${tag}"%`);
      });
    }

    if (filter.accessibilityFeatures && filter.accessibilityFeatures.length > 0) {
      const featureConditions = filter.accessibilityFeatures.map(() => 'accessibility_features LIKE ?').join(' OR ');
      query += ` AND (${featureConditions})`;
      filter.accessibilityFeatures.forEach(feature => {
        params.push(`%"${feature}"%`);
      });
    }

    // Add ordering
    query += ' ORDER BY updated_at DESC';

    // Add pagination
    if (filter.limit) {
      query += ' LIMIT ?';
      params.push(filter.limit);

      if (filter.offset) {
        query += ' OFFSET ?';
        params.push(filter.offset);
      }
    }

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => this.deserializeMetadata(row));
  }

  async createMetadata(metadata: EAMPMetadata): Promise<DatabaseMetadata> {
    const serialized = this.serializeMetadata(metadata);
    
    const stmt = this.db.prepare(`
      INSERT INTO metadata (
        id, type, eamp_version, short_alt, extended_description,
        data_points, transcript, scenes, visual_elements,
        accessibility_features, tags, source_attribution,
        metadata_uri, context, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      serialized.id,
      serialized.type,
      serialized.eamp_version,
      serialized.short_alt,
      serialized.extended_description,
      serialized.data_points,
      serialized.transcript,
      serialized.scenes,
      serialized.visual_elements,
      serialized.accessibility_features,
      serialized.tags,
      serialized.source_attribution,
      serialized.metadata_uri,
      serialized.context,
      serialized.expires_at
    );

    const created = await this.getMetadata(metadata.id);
    if (!created) {
      throw new Error('Failed to create metadata');
    }

    logger.info(`Created metadata: ${metadata.id}`);
    return created;
  }

  async updateMetadata(id: string, metadata: Partial<EAMPMetadata>): Promise<DatabaseMetadata | null> {
    const existing = await this.getMetadata(id);
    if (!existing) {
      return null;
    }

    const updated = { ...existing, ...metadata };
    const serialized = this.serializeMetadata(updated);

    const stmt = this.db.prepare(`
      UPDATE metadata SET
        type = ?, eamp_version = ?, short_alt = ?, extended_description = ?,
        data_points = ?, transcript = ?, scenes = ?, visual_elements = ?,
        accessibility_features = ?, tags = ?, source_attribution = ?,
        metadata_uri = ?, context = ?, expires_at = ?
      WHERE id = ?
    `);

    stmt.run(
      serialized.type,
      serialized.eamp_version,
      serialized.short_alt,
      serialized.extended_description,
      serialized.data_points,
      serialized.transcript,
      serialized.scenes,
      serialized.visual_elements,
      serialized.accessibility_features,
      serialized.tags,
      serialized.source_attribution,
      serialized.metadata_uri,
      serialized.context,
      serialized.expires_at,
      id
    );

    logger.info(`Updated metadata: ${id}`);
    return this.getMetadata(id);
  }

  async deleteMetadata(id: string): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM metadata WHERE id = ?');
    const result = stmt.run(id);
    
    const deleted = result.changes > 0;
    if (deleted) {
      logger.info(`Deleted metadata: ${id}`);
    }
    
    return deleted;
  }

  async getStats(): Promise<{
    totalCount: number;
    typeBreakdown: Record<string, number>;
    recentCount: number;
  }> {
    const totalStmt = this.db.prepare('SELECT COUNT(*) as count FROM metadata');
    const totalResult = totalStmt.get() as { count: number };

    const typeStmt = this.db.prepare(`
      SELECT type, COUNT(*) as count 
      FROM metadata 
      GROUP BY type
    `);
    const typeResults = typeStmt.all() as { type: string; count: number }[];

    const recentStmt = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM metadata 
      WHERE created_at >= datetime('now', '-7 days')
    `);
    const recentResult = recentStmt.get() as { count: number };

    const typeBreakdown: Record<string, number> = {};
    typeResults.forEach(({ type, count }) => {
      typeBreakdown[type] = count;
    });

    return {
      totalCount: totalResult.count,
      typeBreakdown,
      recentCount: recentResult.count,
    };
  }

  close(): void {
    this.db.close();
    logger.info('Database connection closed');
  }

  private serializeMetadata(metadata: EAMPMetadata): any {
    return {
      id: metadata.id,
      type: metadata.type,
      eamp_version: metadata.eampVersion || '1.0.0',
      short_alt: metadata.shortAlt,
      extended_description: metadata.extendedDescription,
      data_points: metadata.dataPoints ? JSON.stringify(metadata.dataPoints) : null,
      transcript: metadata.transcript || null,
      scenes: metadata.scenes ? JSON.stringify(metadata.scenes) : null,
      visual_elements: metadata.visualElements ? JSON.stringify(metadata.visualElements) : null,
      accessibility_features: metadata.accessibilityFeatures ? JSON.stringify(metadata.accessibilityFeatures) : null,
      tags: metadata.tags ? JSON.stringify(metadata.tags) : null,
      source_attribution: metadata.sourceAttribution || null,
      metadata_uri: metadata.metadataURI || null,
      context: metadata.context ? JSON.stringify(metadata.context) : null,
      expires_at: metadata.expiresAt || null,
    };
  }

  private deserializeMetadata(row: any): DatabaseMetadata {
    return {
      id: row.id,
      type: row.type as ContentType,
      eampVersion: row.eamp_version,
      shortAlt: row.short_alt,
      extendedDescription: row.extended_description,
      dataPoints: row.data_points ? JSON.parse(row.data_points) : undefined,
      transcript: row.transcript || undefined,
      scenes: row.scenes ? JSON.parse(row.scenes) : undefined,
      visualElements: row.visual_elements ? JSON.parse(row.visual_elements) : undefined,
      accessibilityFeatures: row.accessibility_features ? JSON.parse(row.accessibility_features) : undefined,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
      sourceAttribution: row.source_attribution || undefined,
      metadataURI: row.metadata_uri || undefined,
      context: row.context ? JSON.parse(row.context) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      expiresAt: row.expires_at || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}