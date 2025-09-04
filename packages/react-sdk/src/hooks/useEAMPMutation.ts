import { useState, useCallback } from 'react';
import { EAMPMetadata, EAMPError } from '@eamp/javascript-sdk';
import { useEAMPContext } from '../providers/EAMPProvider';

export interface UseEAMPMutationOptions {
  onSuccess?: (metadata: EAMPMetadata) => void;
  onError?: (error: EAMPError) => void;
}

export interface UseEAMPMutationReturn {
  createMetadata: (metadata: EAMPMetadata) => Promise<EAMPMetadata | null>;
  updateMetadata: (resourceId: string, updates: Partial<EAMPMetadata>) => Promise<EAMPMetadata | null>;
  deleteMetadata: (resourceId: string) => Promise<boolean>;
  isLoading: boolean;
  error: EAMPError | null;
}

export function useEAMPMutation({
  onSuccess,
  onError
}: UseEAMPMutationOptions = {}): UseEAMPMutationReturn {
  const { client } = useEAMPContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<EAMPError | null>(null);

  const createMetadata = useCallback(async (metadata: EAMPMetadata): Promise<EAMPMetadata | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await client.createMetadata(metadata);
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      const error = err as EAMPError;
      setError(error);
      if (onError) onError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client, onSuccess, onError]);

  const updateMetadata = useCallback(async (
    resourceId: string, 
    updates: Partial<EAMPMetadata>
  ): Promise<EAMPMetadata | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await client.updateMetadata(resourceId, updates);
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      const error = err as EAMPError;
      setError(error);
      if (onError) onError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client, onSuccess, onError]);

  const deleteMetadata = useCallback(async (resourceId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await client.deleteMetadata(resourceId);
      return result;
    } catch (err) {
      const error = err as EAMPError;
      setError(error);
      if (onError) onError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [client, onError]);

  return {
    createMetadata,
    updateMetadata,
    deleteMetadata,
    isLoading,
    error
  };
}