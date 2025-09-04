import { useState, useEffect, useCallback } from 'react';
import { EAMPMetadata, EAMPError, ListMetadataFilter } from '@eamp/javascript-sdk';
import { useEAMPContext } from '../providers/EAMPProvider';

export interface UseEAMPListOptions {
  filter?: ListMetadataFilter;
  autoFetch?: boolean;
}

export interface UseEAMPListReturn {
  metadata: EAMPMetadata[];
  isLoading: boolean;
  error: EAMPError | null;
  refetch: () => Promise<void>;
}

export function useEAMPList({
  filter = {},
  autoFetch = true
}: UseEAMPListOptions = {}): UseEAMPListReturn {
  const { client } = useEAMPContext();
  const [metadata, setMetadata] = useState<EAMPMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<EAMPError | null>(null);

  const fetchMetadata = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await client.listMetadata(filter);
      setMetadata(result);
    } catch (err) {
      setError(err as EAMPError);
      setMetadata([]);
    } finally {
      setIsLoading(false);
    }
  }, [client, filter]);

  const refetch = useCallback(async () => {
    await fetchMetadata();
  }, [fetchMetadata]);

  // Auto-fetch on mount and when filter changes
  useEffect(() => {
    if (autoFetch) {
      fetchMetadata();
    }
  }, [autoFetch, fetchMetadata]);

  return {
    metadata,
    isLoading,
    error,
    refetch
  };
}