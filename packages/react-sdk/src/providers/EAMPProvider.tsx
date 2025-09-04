import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { EAMPClient, EAMPClientOptions, EAMPMetadata } from '@eamp/javascript-sdk';

export interface EAMPContextValue {
  client: EAMPClient;
  isConnected: boolean;
  subscribe: (resourceId: string, callback: (metadata: EAMPMetadata) => void) => () => void;
  unsubscribe: (resourceId: string) => void;
}

const EAMPContext = createContext<EAMPContextValue | null>(null);

export interface EAMPProviderProps {
  children: ReactNode;
  options: EAMPClientOptions;
  autoConnect?: boolean;
}

export function EAMPProvider({ children, options, autoConnect = true }: EAMPProviderProps) {
  const clientRef = useRef<EAMPClient | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const subscriptionsRef = useRef<Map<string, Set<(metadata: EAMPMetadata) => void>>>(new Map());

  // Initialize client
  if (!clientRef.current) {
    clientRef.current = new EAMPClient(options);
  }

  const client = clientRef.current;

  useEffect(() => {
    if (!autoConnect) return;

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleError = (error: Error) => {
      console.error('EAMP WebSocket error:', error);
      setIsConnected(false);
    };

    // Set up WebSocket event listeners if client supports it
    if (client.ws) {
      client.ws.addEventListener('open', handleConnect);
      client.ws.addEventListener('close', handleDisconnect);
      client.ws.addEventListener('error', handleError);

      // Handle incoming metadata updates
      client.ws.addEventListener('message', (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'metadata_updated') {
            const { resourceId, metadata } = message;
            const callbacks = subscriptionsRef.current.get(resourceId);
            if (callbacks) {
              callbacks.forEach(callback => callback(metadata));
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });
    }

    // Connect if WebSocket is available
    if (client.connect) {
      client.connect().catch(console.error);
    }

    return () => {
      if (client.ws) {
        client.ws.removeEventListener('open', handleConnect);
        client.ws.removeEventListener('close', handleDisconnect);
        client.ws.removeEventListener('error', handleError);
      }
      if (client.disconnect) {
        client.disconnect();
      }
    };
  }, [client, autoConnect]);

  const subscribe = React.useCallback((resourceId: string, callback: (metadata: EAMPMetadata) => void) => {
    const subscriptions = subscriptionsRef.current;
    
    if (!subscriptions.has(resourceId)) {
      subscriptions.set(resourceId, new Set());
      
      // Send subscription message to server if WebSocket is connected
      if (client.ws && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify({
          type: 'subscribe',
          resourceId
        }));
      }
    }
    
    const callbacks = subscriptions.get(resourceId)!;
    callbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        subscriptions.delete(resourceId);
        
        // Send unsubscribe message to server
        if (client.ws && client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(JSON.stringify({
            type: 'unsubscribe',
            resourceId
          }));
        }
      }
    };
  }, [client]);

  const unsubscribe = React.useCallback((resourceId: string) => {
    const subscriptions = subscriptionsRef.current;
    if (subscriptions.has(resourceId)) {
      subscriptions.delete(resourceId);
      
      // Send unsubscribe message to server
      if (client.ws && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify({
          type: 'unsubscribe',
          resourceId
        }));
      }
    }
  }, [client]);

  const contextValue: EAMPContextValue = {
    client,
    isConnected,
    subscribe,
    unsubscribe
  };

  return (
    <EAMPContext.Provider value={contextValue}>
      {children}
    </EAMPContext.Provider>
  );
}

export function useEAMPContext(): EAMPContextValue {
  const context = useContext(EAMPContext);
  if (!context) {
    throw new Error('useEAMPContext must be used within an EAMPProvider');
  }
  return context;
}