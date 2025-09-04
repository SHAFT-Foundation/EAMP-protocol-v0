import EventEmitter from 'eventemitter3';
import {
  EAMPMetadata,
  EAMPMetadataSchema,
  EAMPError,
  EAMPErrorSchema,
  MetadataFilter,
  MetadataUpdate,
  ClientOptions,
  ClientOptionsSchema,
  EAMPClientEvents,
} from '../types/metadata.js';
import { HttpTransport } from '../transport/HttpTransport.js';
import { WebSocketTransport } from '../transport/WebSocketTransport.js';
import { MemoryCache } from '../utils/MemoryCache.js';
import { EAMPClientError, ResourceNotFoundError, ValidationError, NetworkError } from '../utils/errors.js';

/**
 * EAMP Client for consuming accessibility metadata
 */
export class EAMPClient extends EventEmitter<EAMPClientEvents> {
  private options: Required<ClientOptions>;
  private httpTransport: HttpTransport;
  private wsTransport?: WebSocketTransport;
  private cache?: MemoryCache<EAMPMetadata>;
  private subscriptions = new Set<string>();

  constructor(options: ClientOptions = {}) {
    super();
    
    this.options = ClientOptionsSchema.parse(options) as Required<ClientOptions>;
    this.httpTransport = new HttpTransport(this.options);
    
    if (this.options.cacheEnabled) {
      this.cache = new MemoryCache<EAMPMetadata>(this.options.cacheTTL);
    }

    this.setupEventHandlers();
  }

  /**
   * Get metadata for a specific resource
   */
  async getMetadata(resourceId: string): Promise<EAMPMetadata> {
    if (!resourceId) {
      throw new EAMPClientError('Resource ID is required');
    }

    // Check cache first
    if (this.cache) {
      const cached = this.cache.get(resourceId);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await this.httpTransport.get(`/metadata/${encodeURIComponent(resourceId)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new ResourceNotFoundError(`Resource not found: ${resourceId}`);
        }
        
        // Try to parse error response
        try {
          const errorData = await response.json();
          const parsedError = EAMPErrorSchema.parse(errorData);
          throw new EAMPClientError(parsedError.error.message, parsedError.error.code);
        } catch {
          throw new NetworkError(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();
      const metadata = EAMPMetadataSchema.parse(data);

      // Cache the result
      if (this.cache) {
        this.cache.set(resourceId, metadata);
      }

      return metadata;
    } catch (error) {
      if (error instanceof EAMPClientError) {
        throw error;
      }
      
      if (error instanceof SyntaxError) {
        throw new ValidationError('Invalid JSON response from server');
      }
      
      throw new NetworkError(`Failed to fetch metadata: ${(error as Error).message}`);
    }
  }

  /**
   * List metadata with optional filtering
   */
  async listMetadata(filter: MetadataFilter = {}): Promise<EAMPMetadata[]> {
    try {
      const params = new URLSearchParams();
      
      if (filter.type) params.append('type', filter.type);
      if (filter.tags) params.append('tags', filter.tags.join(','));
      if (filter.accessibilityFeatures) params.append('features', filter.accessibilityFeatures.join(','));
      if (filter.createdAfter) params.append('createdAfter', filter.createdAfter);
      if (filter.createdBefore) params.append('createdBefore', filter.createdBefore);
      if (filter.hasDataPoints !== undefined) params.append('hasDataPoints', filter.hasDataPoints.toString());
      if (filter.language) params.append('language', filter.language);

      const queryString = params.toString();
      const url = `/metadata${queryString ? `?${queryString}` : ''}`;
      
      const response = await this.httpTransport.get(url);
      
      if (!response.ok) {
        throw new NetworkError(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new ValidationError('Expected array of metadata objects');
      }

      return data.map(item => EAMPMetadataSchema.parse(item));
    } catch (error) {
      if (error instanceof EAMPClientError) {
        throw error;
      }
      
      throw new NetworkError(`Failed to list metadata: ${(error as Error).message}`);
    }
  }

  /**
   * Subscribe to real-time metadata updates for a resource
   */
  async subscribe(resourceId: string): Promise<void> {
    if (!resourceId) {
      throw new EAMPClientError('Resource ID is required');
    }

    if (this.subscriptions.has(resourceId)) {
      return; // Already subscribed
    }

    // Initialize WebSocket connection if needed
    if (!this.wsTransport && this.options.baseURL) {
      const wsUrl = this.options.baseURL.replace(/^https?/, 'ws') + '/ws';
      this.wsTransport = new WebSocketTransport(wsUrl);
      this.setupWebSocketHandlers();
    }

    if (!this.wsTransport) {
      throw new EAMPClientError('WebSocket transport not available');
    }

    await this.wsTransport.connect();
    await this.wsTransport.send({
      action: 'subscribe',
      resourceId,
    });

    this.subscriptions.add(resourceId);
  }

  /**
   * Unsubscribe from metadata updates for a resource
   */
  async unsubscribe(resourceId: string): Promise<void> {
    if (!resourceId || !this.subscriptions.has(resourceId)) {
      return;
    }

    if (this.wsTransport && this.wsTransport.isConnected()) {
      await this.wsTransport.send({
        action: 'unsubscribe',
        resourceId,
      });
    }

    this.subscriptions.delete(resourceId);
  }

  /**
   * Unsubscribe from all metadata updates
   */
  async unsubscribeAll(): Promise<void> {
    const resourceIds = Array.from(this.subscriptions);
    await Promise.all(resourceIds.map(id => this.unsubscribe(id)));
  }

  /**
   * Refresh metadata for a resource (bypass cache)
   */
  async refreshMetadata(resourceId: string): Promise<EAMPMetadata> {
    // Clear from cache
    if (this.cache) {
      this.cache.delete(resourceId);
    }

    return this.getMetadata(resourceId);
  }

  /**
   * Check if client is subscribed to a resource
   */
  isSubscribed(resourceId: string): boolean {
    return this.subscriptions.has(resourceId);
  }

  /**
   * Get list of currently subscribed resource IDs
   */
  getSubscriptions(): string[] {
    return Array.from(this.subscriptions);
  }

  /**
   * Clear all cached metadata
   */
  clearCache(): void {
    if (this.cache) {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache?.getStats() ?? null;
  }

  /**
   * Disconnect and cleanup resources
   */
  async disconnect(): Promise<void> {
    await this.unsubscribeAll();
    
    if (this.wsTransport) {
      await this.wsTransport.disconnect();
    }
    
    this.removeAllListeners();
    this.emit('disconnected');
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Handle HTTP transport errors
    this.httpTransport.on('error', (error) => {
      this.emit('error', error);
    });
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupWebSocketHandlers(): void {
    if (!this.wsTransport) return;

    this.wsTransport.on('connected', () => {
      this.emit('connected');
    });

    this.wsTransport.on('disconnected', () => {
      this.emit('disconnected');
    });

    this.wsTransport.on('message', (message) => {
      try {
        if (message.type === 'metadata_updated') {
          const update: MetadataUpdate = {
            resourceId: message.resourceId,
            changeType: message.changeType,
            timestamp: message.timestamp,
            metadata: message.metadata ? EAMPMetadataSchema.parse(message.metadata) : undefined,
          };

          // Update cache if we have the metadata
          if (this.cache && update.metadata) {
            this.cache.set(update.resourceId, update.metadata);
          }

          this.emit('metadataUpdated', update);
        }
      } catch (error) {
        this.emit('error', new ValidationError(`Invalid update message: ${(error as Error).message}`));
      }
    });

    this.wsTransport.on('error', (error) => {
      this.emit('error', error);
    });
  }
}