import { Router, Request, Response } from 'express';
import { MetadataDatabase } from '../services/database.js';
import { 
  validateResourceId, 
  validateMetadataBody, 
  validateListQuery,
  validateEAMPMetadata,
  handleValidationErrors,
  parseListQuery
} from '../middleware/validation.js';
import logger from '../utils/logger.js';
import { EAMPMetadata } from '@eamp/javascript-sdk';

export function createMetadataRoutes(db: MetadataDatabase): Router {
  const router = Router();

  /**
   * GET /metadata/:resourceId
   * Get metadata for a specific resource
   */
  router.get(
    '/:resourceId',
    validateResourceId,
    handleValidationErrors,
    async (req: Request, res: Response) => {
      try {
        const { resourceId } = req.params;
        
        logger.info(`Getting metadata for resource: ${resourceId}`);
        
        const metadata = await db.getMetadata(resourceId);
        
        if (!metadata) {
          return res.status(404).json({
            error: {
              code: 'RESOURCE_NOT_FOUND',
              message: `Resource not found: ${resourceId}`,
            },
          });
        }

        // Set appropriate headers
        res.set({
          'Content-Type': 'application/eamp+json',
          'Cache-Control': 'public, max-age=300',
          'ETag': `"${metadata.updated_at}"`,
        });

        // Remove database-specific fields from response
        const { created_at, updated_at, ...responseData } = metadata;
        
        res.json(responseData);
      } catch (error) {
        logger.error(`Error getting metadata: ${error}`);
        res.status(500).json({
          error: {
            code: 'SERVER_ERROR',
            message: 'Internal server error',
          },
        });
      }
    }
  );

  /**
   * GET /metadata
   * List metadata with optional filtering
   */
  router.get(
    '/',
    validateListQuery,
    handleValidationErrors,
    parseListQuery,
    async (req: Request, res: Response) => {
      try {
        const filter = (req as any).filter || {};
        
        logger.info(`Listing metadata with filter: ${JSON.stringify(filter)}`);
        
        const metadataList = await db.listMetadata(filter);
        
        // Remove database-specific fields from response
        const responseData = metadataList.map(({ created_at, updated_at, ...item }) => item);
        
        // Set appropriate headers
        res.set({
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60',
          'X-Total-Count': responseData.length.toString(),
        });

        res.json(responseData);
      } catch (error) {
        logger.error(`Error listing metadata: ${error}`);
        res.status(500).json({
          error: {
            code: 'SERVER_ERROR',
            message: 'Internal server error',
          },
        });
      }
    }
  );

  /**
   * POST /metadata
   * Create new metadata
   */
  router.post(
    '/',
    validateMetadataBody,
    handleValidationErrors,
    validateEAMPMetadata,
    async (req: Request, res: Response) => {
      try {
        const metadata = req.body as EAMPMetadata;
        
        logger.info(`Creating metadata for resource: ${metadata.id}`);
        
        // Check if resource already exists
        const existing = await db.getMetadata(metadata.id);
        if (existing) {
          return res.status(409).json({
            error: {
              code: 'RESOURCE_EXISTS',
              message: `Resource already exists: ${metadata.id}`,
            },
          });
        }

        const created = await db.createMetadata(metadata);
        
        // Remove database-specific fields from response
        const { created_at, updated_at, ...responseData } = created;
        
        res.status(201).json(responseData);
      } catch (error) {
        logger.error(`Error creating metadata: ${error}`);
        res.status(500).json({
          error: {
            code: 'SERVER_ERROR',
            message: 'Internal server error',
          },
        });
      }
    }
  );

  /**
   * PUT /metadata/:resourceId
   * Update existing metadata
   */
  router.put(
    '/:resourceId',
    validateResourceId,
    validateMetadataBody,
    handleValidationErrors,
    validateEAMPMetadata,
    async (req: Request, res: Response) => {
      try {
        const { resourceId } = req.params;
        const metadata = req.body as EAMPMetadata;
        
        // Ensure ID matches
        if (metadata.id !== resourceId) {
          return res.status(400).json({
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Resource ID in URL does not match ID in body',
            },
          });
        }
        
        logger.info(`Updating metadata for resource: ${resourceId}`);
        
        const updated = await db.updateMetadata(resourceId, metadata);
        
        if (!updated) {
          return res.status(404).json({
            error: {
              code: 'RESOURCE_NOT_FOUND',
              message: `Resource not found: ${resourceId}`,
            },
          });
        }

        // Remove database-specific fields from response
        const { created_at, updated_at, ...responseData } = updated;
        
        res.json(responseData);
      } catch (error) {
        logger.error(`Error updating metadata: ${error}`);
        res.status(500).json({
          error: {
            code: 'SERVER_ERROR',
            message: 'Internal server error',
          },
        });
      }
    }
  );

  /**
   * PATCH /metadata/:resourceId
   * Partially update existing metadata
   */
  router.patch(
    '/:resourceId',
    validateResourceId,
    handleValidationErrors,
    async (req: Request, res: Response) => {
      try {
        const { resourceId } = req.params;
        const updates = req.body;
        
        logger.info(`Partially updating metadata for resource: ${resourceId}`);
        
        const updated = await db.updateMetadata(resourceId, updates);
        
        if (!updated) {
          return res.status(404).json({
            error: {
              code: 'RESOURCE_NOT_FOUND',
              message: `Resource not found: ${resourceId}`,
            },
          });
        }

        // Remove database-specific fields from response
        const { created_at, updated_at, ...responseData } = updated;
        
        res.json(responseData);
      } catch (error) {
        logger.error(`Error partially updating metadata: ${error}`);
        res.status(500).json({
          error: {
            code: 'SERVER_ERROR',
            message: 'Internal server error',
          },
        });
      }
    }
  );

  /**
   * DELETE /metadata/:resourceId
   * Delete metadata
   */
  router.delete(
    '/:resourceId',
    validateResourceId,
    handleValidationErrors,
    async (req: Request, res: Response) => {
      try {
        const { resourceId } = req.params;
        
        logger.info(`Deleting metadata for resource: ${resourceId}`);
        
        const deleted = await db.deleteMetadata(resourceId);
        
        if (!deleted) {
          return res.status(404).json({
            error: {
              code: 'RESOURCE_NOT_FOUND',
              message: `Resource not found: ${resourceId}`,
            },
          });
        }

        res.status(204).send();
      } catch (error) {
        logger.error(`Error deleting metadata: ${error}`);
        res.status(500).json({
          error: {
            code: 'SERVER_ERROR',
            message: 'Internal server error',
          },
        });
      }
    }
  );

  return router;
}