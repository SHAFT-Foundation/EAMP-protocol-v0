import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { EAMPClient } from '../../client/EAMPClient';
import { EAMPError, EAMPNetworkError, EAMPValidationError } from '../../utils/errors';
import { EAMPMetadata } from '../../types/metadata';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('EAMPClient', () => {
  let client: EAMPClient;
  const baseUrl = 'https://api.example.com';
  const apiKey = 'test-api-key';

  const sampleMetadata: EAMPMetadata = {
    id: 'test-resource',
    type: 'image',
    eampVersion: '1.0.0',
    shortAlt: 'Test image description',
    extendedDescription: 'A detailed description of the test image',
    tags: ['test', 'sample']
  };

  beforeEach(() => {
    client = new EAMPClient({
      baseUrl,
      apiKey,
      cacheEnabled: false // Disable cache for predictable tests
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('constructor', () => {
    it('should create client with default options', () => {
      const defaultClient = new EAMPClient();
      expect(defaultClient).toBeInstanceOf(EAMPClient);
    });

    it('should create client with custom options', () => {
      const customClient = new EAMPClient({
        baseUrl: 'https://custom.api.com',
        apiKey: 'custom-key',
        timeout: 5000,
        cacheEnabled: true,
        cacheTtl: 600
      });
      expect(customClient).toBeInstanceOf(EAMPClient);
    });
  });

  describe('getMetadata', () => {
    it('should fetch metadata successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => sampleMetadata,
        headers: new Headers({ 'content-type': 'application/json' })
      });

      const result = await client.getMetadata('test-resource');
      
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/metadata/test-resource`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Accept': 'application/json',
            'X-API-Key': apiKey
          })
        })
      );
      expect(result).toEqual(sampleMetadata);
    });

    it('should handle 404 not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: 'Resource not found'
          }
        })
      });

      await expect(client.getMetadata('non-existent'))
        .rejects.toThrow(EAMPError);
      
      try {
        await client.getMetadata('non-existent');
      } catch (error) {
        expect(error).toBeInstanceOf(EAMPError);
        expect((error as EAMPError).code).toBe('RESOURCE_NOT_FOUND');
        expect((error as EAMPError).status).toBe(404);
      }
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.getMetadata('test-resource'))
        .rejects.toThrow(EAMPNetworkError);
    });

    it('should validate response data', async () => {
      const invalidMetadata = {
        id: 'test-resource',
        type: 'invalid-type', // Invalid type
        shortAlt: 'Test'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => invalidMetadata
      });

      await expect(client.getMetadata('test-resource'))
        .rejects.toThrow(EAMPValidationError);
    });
  });

  describe('listMetadata', () => {
    const metadataList = [sampleMetadata, { ...sampleMetadata, id: 'test-resource-2' }];

    it('should list metadata without filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => metadataList,
        headers: new Headers({ 
          'content-type': 'application/json',
          'X-Total-Count': '2'
        })
      });

      const result = await client.listMetadata();
      
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/metadata`,
        expect.objectContaining({
          method: 'GET'
        })
      );
      expect(result).toEqual(metadataList);
    });

    it('should list metadata with filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [sampleMetadata],
        headers: new Headers({ 
          'content-type': 'application/json',
          'X-Total-Count': '1'
        })
      });

      const filters = {
        type: 'image',
        tags: ['test'],
        limit: 10,
        offset: 0
      };

      await client.listMetadata(filters);
      
      const expectedUrl = new URL(`${baseUrl}/metadata`);
      expectedUrl.searchParams.set('type', 'image');
      expectedUrl.searchParams.set('tags', 'test');
      expectedUrl.searchParams.set('limit', '10');
      expectedUrl.searchParams.set('offset', '0');

      expect(mockFetch).toHaveBeenCalledWith(
        expectedUrl.toString(),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });

  describe('createMetadata', () => {
    it('should create metadata successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => sampleMetadata
      });

      const result = await client.createMetadata(sampleMetadata);
      
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/metadata`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-API-Key': apiKey
          }),
          body: JSON.stringify(sampleMetadata)
        })
      );
      expect(result).toEqual(sampleMetadata);
    });

    it('should validate input before sending', async () => {
      const invalidMetadata = {
        id: 'test',
        type: 'invalid'
      } as any;

      await expect(client.createMetadata(invalidMetadata))
        .rejects.toThrow(EAMPValidationError);
      
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle conflict errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          error: {
            code: 'RESOURCE_EXISTS',
            message: 'Resource already exists'
          }
        })
      });

      await expect(client.createMetadata(sampleMetadata))
        .rejects.toThrow(EAMPError);
    });
  });

  describe('updateMetadata', () => {
    const updates = {
      shortAlt: 'Updated description',
      tags: ['updated', 'test']
    };

    it('should update metadata successfully', async () => {
      const updatedMetadata = { ...sampleMetadata, ...updates };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => updatedMetadata
      });

      const result = await client.updateMetadata('test-resource', updates);
      
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/metadata/test-resource`,
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-API-Key': apiKey
          }),
          body: JSON.stringify(updates)
        })
      );
      expect(result).toEqual(updatedMetadata);
    });
  });

  describe('deleteMetadata', () => {
    it('should delete metadata successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      });

      const result = await client.deleteMetadata('test-resource');
      
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/metadata/test-resource`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'X-API-Key': apiKey
          })
        })
      );
      expect(result).toBe(true);
    });

    it('should return false for non-existent resource', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const result = await client.deleteMetadata('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('caching', () => {
    beforeEach(() => {
      client = new EAMPClient({
        baseUrl,
        apiKey,
        cacheEnabled: true,
        cacheTtl: 300
      });
    });

    it('should cache successful GET requests', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => sampleMetadata
      });

      // First request
      const result1 = await client.getMetadata('test-resource');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      
      // Second request should use cache
      const result2 = await client.getMetadata('test-resource');
      expect(mockFetch).toHaveBeenCalledTimes(1); // No additional call
      
      expect(result1).toEqual(result2);
    });

    it('should invalidate cache on mutations', async () => {
      // Setup cache
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => sampleMetadata
      });
      
      await client.getMetadata('test-resource');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      
      // Update should invalidate cache
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ ...sampleMetadata, shortAlt: 'Updated' })
      });
      
      await client.updateMetadata('test-resource', { shortAlt: 'Updated' });
      
      // Next GET should make new request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ ...sampleMetadata, shortAlt: 'Updated' })
      });
      
      await client.getMetadata('test-resource');
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });
});