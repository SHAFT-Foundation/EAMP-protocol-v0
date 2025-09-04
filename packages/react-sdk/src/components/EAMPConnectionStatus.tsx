import React from 'react';
import { useEAMPContext } from '../providers/EAMPProvider';

export interface EAMPConnectionStatusProps {
  showWhenConnected?: boolean;
  className?: string;
  connectedText?: string;
  disconnectedText?: string;
  onStatusChange?: (isConnected: boolean) => void;
}

export function EAMPConnectionStatus({
  showWhenConnected = false,
  className = '',
  connectedText = 'Connected to EAMP server',
  disconnectedText = 'Disconnected from EAMP server',
  onStatusChange
}: EAMPConnectionStatusProps) {
  const { isConnected } = useEAMPContext();

  React.useEffect(() => {
    if (onStatusChange) {
      onStatusChange(isConnected);
    }
  }, [isConnected, onStatusChange]);

  if (isConnected && !showWhenConnected) {
    return null;
  }

  return (
    <div 
      className={`eamp-connection-status ${
        isConnected ? 'eamp-connected' : 'eamp-disconnected'
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="eamp-status-indicator">
        <span 
          className={`eamp-status-dot ${
            isConnected ? 'eamp-dot-connected' : 'eamp-dot-disconnected'
          }`} 
        />
        <span className="eamp-status-text">
          {isConnected ? connectedText : disconnectedText}
        </span>
      </div>
    </div>
  );
}