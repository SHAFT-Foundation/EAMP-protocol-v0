import { useState, useEffect, useCallback } from 'react';
import { EAMPMetadata, EAMPError } from '@eamp/javascript-sdk';
import { useEAMPContext } from '../providers/EAMPProvider';

export interface UseEAMPMetadataOptions {
  resourceId: string;
  autoFetch?: boolean;
  enableRealTimeUpdates?: boolean;
}

export interface UseEAMPMetadataReturn {
  metadata: EAMPMetadata | null;
  isLoading: boolean;
  error: EAMPError | null;
  refetch: () => Promise<void>;
}

export function useEAMPMetadata({
  resourceId,
  autoFetch = true,
  enableRealTimeUpdates = true
}: UseEAMPMetadataOptions): UseEAMPMetadataReturn {
  const { client, subscribe } = useEAMPContext();
  const [metadata, setMetadata] = useState<EAMPMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<EAMPError | null>(null);

  const fetchMetadata = useCallback(async () => {
    if (!resourceId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await client.getMetadata(resourceId);
      setMetadata(result);
    } catch (err) {
      setError(err as EAMPError);
      setMetadata(null);
    } finally {
      setIsLoading(false);
    }
  }, [client, resourceId]);

  const refetch = useCallback(async () => {
    await fetchMetadata();
  }, [fetchMetadata]);

  // Auto-fetch on mount and when resourceId changes
  useEffect(() => {
    if (autoFetch) {
      fetchMetadata();
    }
  }, [autoFetch, fetchMetadata]);

  // Set up real-time updates
  useEffect(() => {
    if (!enableRealTimeUpdates || !resourceId) return;

    const unsubscribe = subscribe(resourceId, (updatedMetadata) => {
      setMetadata(updatedMetadata);
    });

    return unsubscribe;
  }, [enableRealTimeUpdates, resourceId, subscribe]);

  return {
    metadata,
    isLoading,
    error,
    refetch
  };
}