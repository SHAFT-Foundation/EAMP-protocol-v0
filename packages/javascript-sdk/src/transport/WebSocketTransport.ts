import EventEmitter from 'eventemitter3';
import WebSocket from 'ws';
import { NetworkError } from '../utils/errors.js';

type WebSocketMessage = {
  type: string;
  [key: string]: unknown;
};

type WebSocketTransportEvents = {
  connected: [];
  disconnected: [];
  message: [WebSocketMessage];
  error: [Error];
};

/**
 * WebSocket Transport for real-time EAMP updates
 */
export class WebSocketTransport extends EventEmitter<WebSocketTransportEvents> {
  private ws?: WebSocket;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isReconnecting = false;
  private messageQueue: unknown[] = [];
  private heartbeatInterval?: NodeJS.Timeout;
  private heartbeatTimeoutId?: NodeJS.Timeout;

  constructor(url: string) {
    super();
    this.url = url;
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.isConnected()) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        this.setupEventHandlers();

        this.ws.on('open', () => {
          this.reconnectAttempts = 0;
          this.isReconnecting = false;
          this.startHeartbeat();
          this.flushMessageQueue();
          this.emit('connected');
          resolve();
        });

        this.ws.on('error', (error) => {
          reject(new NetworkError(`WebSocket connection failed: ${error.message}`));
        });

      } catch (error) {
        reject(new NetworkError(`Failed to create WebSocket: ${(error as Error).message}`));
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  async disconnect(): Promise<void> {
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = undefined;
    }
    
    this.messageQueue = [];
    this.isReconnecting = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Send message to server
   */
  async send(message: unknown): Promise<void> {
    if (!this.isConnected()) {
      // Queue message for when connection is established
      this.messageQueue.push(message);
      
      if (!this.isReconnecting) {
        await this.reconnect();
      }
      return;
    }

    try {
      this.ws!.send(JSON.stringify(message));
    } catch (error) {
      throw new NetworkError(`Failed to send WebSocket message: ${(error as Error).message}`);
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString()) as WebSocketMessage;
        
        // Handle heartbeat pong
        if (message.type === 'pong') {
          this.resetHeartbeatTimeout();
          return;
        }
        
        this.emit('message', message);
      } catch (error) {
        this.emit('error', new Error(`Invalid WebSocket message format: ${(error as Error).message}`));
      }
    });

    this.ws.on('close', (code, reason) => {
      this.stopHeartbeat();
      this.emit('disconnected');
      
      // Attempt reconnection for unexpected closures
      if (code !== 1000 && !this.isReconnecting && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnect().catch(error => {
          this.emit('error', error);
        });
      }
    });

    this.ws.on('error', (error) => {
      this.emit('error', new NetworkError(`WebSocket error: ${error.message}`));
    });
  }

  /**
   * Attempt to reconnect to WebSocket server
   */
  private async reconnect(): Promise<void> {
    if (this.isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;

    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    await this.sleep(delay);
    
    try {
      await this.connect();
    } catch (error) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.isReconnecting = false;
        this.emit('error', new NetworkError(`Failed to reconnect after ${this.maxReconnectAttempts} attempts`));
      } else {
        // Continue trying to reconnect
        this.reconnect().catch(err => {
          this.emit('error', err);
        });
      }
    }
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift();
      try {
        this.ws!.send(JSON.stringify(message));
      } catch (error) {
        // Re-queue message if send fails
        this.messageQueue.unshift(message);
        break;
      }
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.ws!.send(JSON.stringify({ type: 'ping' }));
        
        // Set timeout for pong response
        this.heartbeatTimeoutId = setTimeout(() => {
          // No pong received, close connection to trigger reconnect
          this.ws?.close(1001, 'Heartbeat timeout');
        }, 10000);
      }
    }, 30000); // Send ping every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
    
    if (this.heartbeatTimeoutId) {
      clearTimeout(this.heartbeatTimeoutId);
      this.heartbeatTimeoutId = undefined;
    }
  }

  /**
   * Reset heartbeat timeout (when pong is received)
   */
  private resetHeartbeatTimeout(): void {
    if (this.heartbeatTimeoutId) {
      clearTimeout(this.heartbeatTimeoutId);
      this.heartbeatTimeoutId = undefined;
    }
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}