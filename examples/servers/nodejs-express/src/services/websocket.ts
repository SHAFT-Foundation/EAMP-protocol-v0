import WebSocket from 'ws';
import { IncomingMessage } from 'http';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import config from '../config/index.js';

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface SubscriptionMessage extends WebSocketMessage {
  type: 'subscribe' | 'unsubscribe';
  resourceId: string;
}

export interface MetadataUpdateMessage extends WebSocketMessage {
  type: 'metadata_updated';
  resourceId: string;
  changeType: 'created' | 'updated' | 'deleted' | 'data_updated';
  timestamp: string;
  metadata?: any;
}

interface ClientConnection {
  id: string;
  ws: WebSocket;
  subscriptions: Set<string>;
  lastSeen: number;
}

export class WebSocketManager {
  private wss: WebSocket.Server;
  private clients = new Map<string, ClientConnection>();
  private subscriptions = new Map<string, Set<string>>(); // resourceId -> Set of clientIds
  private heartbeatInterval?: NodeJS.Timeout;

  constructor(server: any) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws',
      maxPayload: 16 * 1024, // 16KB max message size
    });

    this.setupEventHandlers();
    this.startHeartbeat();
    
    logger.info('WebSocket server initialized');
  }

  private setupEventHandlers(): void {
    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      this.handleConnection(ws, req);
    });

    this.wss.on('error', (error: Error) => {
      logger.error(`WebSocket server error: ${error.message}`);
    });
  }

  private handleConnection(ws: WebSocket, req: IncomingMessage): void {
    const clientId = uuidv4();
    const clientIP = req.socket.remoteAddress;
    
    // Check connection limit
    if (this.clients.size >= config.websocket.maxConnections) {
      logger.warn(`Connection limit exceeded. Rejecting connection from ${clientIP}`);
      ws.close(1013, 'Server overloaded');
      return;
    }

    const client: ClientConnection = {
      id: clientId,
      ws,
      subscriptions: new Set(),
      lastSeen: Date.now(),
    };

    this.clients.set(clientId, client);
    logger.info(`Client connected: ${clientId} from ${clientIP}`);

    // Setup client event handlers
    ws.on('message', (data: WebSocket.RawData) => {
      this.handleMessage(clientId, data);
    });

    ws.on('close', (code: number, reason: Buffer) => {
      this.handleDisconnection(clientId, code, reason.toString());
    });

    ws.on('error', (error: Error) => {
      logger.error(`Client ${clientId} error: ${error.message}`);
      this.handleDisconnection(clientId);
    });

    ws.on('pong', () => {
      const client = this.clients.get(clientId);
      if (client) {
        client.lastSeen = Date.now();
      }
    });

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'connected',
      clientId,
      timestamp: new Date().toISOString(),
    });
  }

  private handleMessage(clientId: string, data: WebSocket.RawData): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.lastSeen = Date.now();

    try {
      const message = JSON.parse(data.toString()) as WebSocketMessage;
      
      switch (message.type) {
        case 'ping':
          this.sendToClient(clientId, { type: 'pong' });
          break;
          
        case 'subscribe':
          this.handleSubscription(clientId, message as SubscriptionMessage);
          break;
          
        case 'unsubscribe':
          this.handleUnsubscription(clientId, message as SubscriptionMessage);
          break;
          
        default:
          logger.warn(`Unknown message type from client ${clientId}: ${message.type}`);
          this.sendToClient(clientId, {
            type: 'error',
            message: `Unknown message type: ${message.type}`,
          });
      }
    } catch (error) {
      logger.warn(`Invalid message from client ${clientId}: ${error}`);
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Invalid message format',
      });
    }
  }

  private handleSubscription(clientId: string, message: SubscriptionMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { resourceId } = message;
    
    // Add to client subscriptions
    client.subscriptions.add(resourceId);
    
    // Add to global subscriptions map
    if (!this.subscriptions.has(resourceId)) {
      this.subscriptions.set(resourceId, new Set());
    }
    this.subscriptions.get(resourceId)!.add(clientId);
    
    logger.info(`Client ${clientId} subscribed to ${resourceId}`);
    
    this.sendToClient(clientId, {
      type: 'subscribed',
      resourceId,
      timestamp: new Date().toISOString(),
    });
  }

  private handleUnsubscription(clientId: string, message: SubscriptionMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { resourceId } = message;
    
    // Remove from client subscriptions
    client.subscriptions.delete(resourceId);
    
    // Remove from global subscriptions map
    const subscribers = this.subscriptions.get(resourceId);
    if (subscribers) {
      subscribers.delete(clientId);
      if (subscribers.size === 0) {
        this.subscriptions.delete(resourceId);
      }
    }
    
    logger.info(`Client ${clientId} unsubscribed from ${resourceId}`);
    
    this.sendToClient(clientId, {
      type: 'unsubscribed',
      resourceId,
      timestamp: new Date().toISOString(),
    });
  }

  private handleDisconnection(clientId: string, code?: number, reason?: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    logger.info(`Client disconnected: ${clientId} (code: ${code}, reason: ${reason})`);

    // Clean up subscriptions
    for (const resourceId of client.subscriptions) {
      const subscribers = this.subscriptions.get(resourceId);
      if (subscribers) {
        subscribers.delete(clientId);
        if (subscribers.size === 0) {
          this.subscriptions.delete(resourceId);
        }
      }
    }

    // Remove client
    this.clients.delete(clientId);
  }

  private sendToClient(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      client.ws.send(JSON.stringify(message));
    } catch (error) {
      logger.error(`Failed to send message to client ${clientId}: ${error}`);
      this.handleDisconnection(clientId);
    }
  }

  /**
   * Broadcast metadata update to all subscribed clients
   */
  public broadcastMetadataUpdate(update: MetadataUpdateMessage): void {
    const subscribers = this.subscriptions.get(update.resourceId);
    if (!subscribers || subscribers.size === 0) {
      return;
    }

    logger.info(`Broadcasting update for ${update.resourceId} to ${subscribers.size} clients`);

    for (const clientId of subscribers) {
      this.sendToClient(clientId, update);
    }
  }

  /**
   * Get connection statistics
   */
  public getStats(): {
    connectedClients: number;
    totalSubscriptions: number;
    resourcesWithSubscriptions: number;
  } {
    let totalSubscriptions = 0;
    for (const client of this.clients.values()) {
      totalSubscriptions += client.subscriptions.size;
    }

    return {
      connectedClients: this.clients.size,
      totalSubscriptions,
      resourcesWithSubscriptions: this.subscriptions.size,
    };
  }

  /**
   * Start heartbeat to detect stale connections
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const timeout = config.websocket.heartbeatInterval * 2; // 2x heartbeat interval

      for (const [clientId, client] of this.clients.entries()) {
        if (now - client.lastSeen > timeout) {
          logger.info(`Client ${clientId} timed out, closing connection`);
          client.ws.terminate();
          this.handleDisconnection(clientId);
        } else if (client.ws.readyState === WebSocket.OPEN) {
          // Send ping
          client.ws.ping();
        }
      }
    }, config.websocket.heartbeatInterval);
  }

  /**
   * Close all connections and cleanup
   */
  public close(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    for (const client of this.clients.values()) {
      client.ws.close(1001, 'Server shutting down');
    }

    this.wss.close(() => {
      logger.info('WebSocket server closed');
    });
  }
}