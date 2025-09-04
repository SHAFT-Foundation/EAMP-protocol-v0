// Core client
export { EAMPClient } from './client/EAMPClient.js';

// Types
export type {
  EAMPMetadata,
  DataPoint,
  Scene,
  VisualElement,
  Context,
  EAMPError,
  MetadataFilter,
  MetadataUpdate,
  ClientOptions,
  ServerInfo,
  ContentType,
  MetadataProvider,
  EAMPClientEvents,
  EAMPServerEvents,
} from './types/metadata.js';

// Schemas for runtime validation
export {
  EAMPMetadataSchema,
  DataPointSchema,
  SceneSchema,
  VisualElementSchema,
  ContextSchema,
  EAMPErrorSchema,
  MetadataFilterSchema,
  MetadataUpdateSchema,
  ClientOptionsSchema,
  ServerInfoSchema,
  ContentTypeSchema,
} from './types/metadata.js';

// Transport classes
export { HttpTransport } from './transport/HttpTransport.js';
export { WebSocketTransport } from './transport/WebSocketTransport.js';

// Utilities
export { MemoryCache } from './utils/MemoryCache.js';

// Errors
export {
  EAMPClientError,
  ResourceNotFoundError,
  ValidationError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  ServerError,
  TimeoutError,
} from './utils/errors.js';

// Validation helpers
export const validateMetadata = (data: unknown) => {
  return EAMPMetadataSchema.parse(data);
};

export const validateFilter = (data: unknown) => {
  return MetadataFilterSchema.parse(data);
};

export const validateClientOptions = (data: unknown) => {
  return ClientOptionsSchema.parse(data);
};

// Version
export const VERSION = '1.0.0';