import { z } from 'zod';

/**
 * EAMP Content Types
 */
export const ContentTypeSchema = z.enum(['image', 'video', 'audio', 'ui-element', 'document']);
export type ContentType = z.infer<typeof ContentTypeSchema>;

/**
 * Data Point Schema
 */
export const DataPointSchema = z.object({
  label: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean()]),
  unit: z.string().optional(),
  category: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type DataPoint = z.infer<typeof DataPointSchema>;

/**
 * Scene Schema for video/audio content
 */
export const SceneSchema = z.object({
  time: z.string().regex(/^\d{1,2}:\d{2}(:\d{2})?(-\d{1,2}:\d{2}(:\d{2})?)?$/),
  description: z.string().min(1),
  speakers: z.array(z.string()).optional(),
  visualElements: z.array(z.string()).optional(),
  audioElements: z.array(z.string()).optional(),
});
export type Scene = z.infer<typeof SceneSchema>;

/**
 * Visual Element Schema for images
 */
export const VisualElementSchema = z.object({
  type: z.enum(['text', 'shape', 'color', 'pattern', 'icon', 'chart', 'graph', 'map', 'photo', 'illustration']),
  description: z.string().min(1),
  position: z.string().optional(),
  color: z.string().optional(),
  size: z.enum(['small', 'medium', 'large']).optional(),
});
export type VisualElement = z.infer<typeof VisualElementSchema>;

/**
 * Context Schema
 */
export const ContextSchema = z.object({
  pageTitle: z.string().optional(),
  sectionHeading: z.string().optional(),
  surroundingText: z.string().optional(),
  purpose: z.string().optional(),
  userTask: z.string().optional(),
  relatedElements: z.array(z.string()).optional(),
});
export type Context = z.infer<typeof ContextSchema>;

/**
 * Core EAMP Metadata Schema
 */
export const EAMPMetadataSchema = z.object({
  id: z.string().min(1),
  type: ContentTypeSchema,
  eampVersion: z.string().regex(/^\d+\.\d+\.\d+$/).default('1.0.0'),
  shortAlt: z.string().max(250).min(1),
  extendedDescription: z.string().min(1),
  dataPoints: z.array(DataPointSchema).optional(),
  transcript: z.string().optional(),
  scenes: z.array(SceneSchema).optional(),
  visualElements: z.array(VisualElementSchema).optional(),
  accessibilityFeatures: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  sourceAttribution: z.string().optional(),
  metadataURI: z.string().url().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  context: ContextSchema.optional(),
  // Support for multilingual fields using BCP 47 language tags
}).catchall(z.string()); // Allow additional fields for multilingual support

export type EAMPMetadata = z.infer<typeof EAMPMetadataSchema>;

/**
 * Error Schema
 */
export const EAMPErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    field: z.string().optional(),
    details: z.record(z.unknown()).optional(),
  }),
});
export type EAMPError = z.infer<typeof EAMPErrorSchema>;

/**
 * Metadata Filter for querying
 */
export const MetadataFilterSchema = z.object({
  type: ContentTypeSchema.optional(),
  tags: z.array(z.string()).optional(),
  accessibilityFeatures: z.array(z.string()).optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
  hasDataPoints: z.boolean().optional(),
  language: z.string().optional(),
});
export type MetadataFilter = z.infer<typeof MetadataFilterSchema>;

/**
 * Metadata Update Event
 */
export const MetadataUpdateSchema = z.object({
  resourceId: z.string(),
  changeType: z.enum(['created', 'updated', 'deleted', 'data_updated']),
  timestamp: z.string().datetime(),
  metadata: EAMPMetadataSchema.optional(),
});
export type MetadataUpdate = z.infer<typeof MetadataUpdateSchema>;

/**
 * Client Configuration
 */
export const ClientOptionsSchema = z.object({
  baseURL: z.string().url().optional(),
  timeout: z.number().positive().default(30000),
  retryAttempts: z.number().nonnegative().default(3),
  cacheEnabled: z.boolean().default(true),
  cacheTTL: z.number().positive().default(300000), // 5 minutes
  userAgent: z.string().optional(),
  headers: z.record(z.string()).optional(),
});
export type ClientOptions = z.infer<typeof ClientOptionsSchema>;

/**
 * Server Configuration
 */
export const ServerInfoSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  capabilities: z.object({
    realTimeUpdates: z.boolean().default(false),
    dataPoints: z.boolean().default(true),
    multiLanguage: z.boolean().default(false),
    web3Support: z.boolean().default(false),
  }).optional(),
});
export type ServerInfo = z.infer<typeof ServerInfoSchema>;

/**
 * Transport Types
 */
export type Transport = 'http' | 'websocket' | 'ipfs' | 'arweave';

/**
 * Metadata Provider Function Type
 */
export type MetadataProvider = (resourceId: string) => Promise<EAMPMetadata | null>;

/**
 * Event Types
 */
export type EAMPClientEvents = {
  metadataUpdated: [MetadataUpdate];
  connected: [];
  disconnected: [];
  error: [Error];
};

export type EAMPServerEvents = {
  metadataRequested: [string]; // resourceId
  subscribed: [string]; // resourceId
  unsubscribed: [string]; // resourceId
  error: [Error];
};