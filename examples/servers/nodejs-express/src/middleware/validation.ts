import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { EAMPMetadataSchema, ContentType } from '@eamp/javascript-sdk';
import logger from '../utils/logger.js';

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn(`Validation errors: ${JSON.stringify(errors.array())}`);
    
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: errors.array(),
      },
    });
  }
  
  next();
};

/**
 * Validate resource ID parameter
 */
export const validateResourceId = [
  param('resourceId')
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('Resource ID must be a non-empty string with max 255 characters'),
];

/**
 * Validate EAMP metadata body
 */
export const validateMetadataBody = [
  body('id')
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('ID must be a non-empty string'),
  
  body('type')
    .isIn(['image', 'video', 'audio', 'ui-element', 'document'])
    .withMessage('Type must be one of: image, video, audio, ui-element, document'),
  
  body('shortAlt')
    .isString()
    .isLength({ min: 1, max: 250 })
    .withMessage('shortAlt must be between 1 and 250 characters'),
  
  body('extendedDescription')
    .isString()
    .isLength({ min: 1 })
    .withMessage('extendedDescription must be a non-empty string'),
  
  body('eampVersion')
    .optional()
    .matches(/^\d+\.\d+\.\d+$/)
    .withMessage('eampVersion must follow semantic versioning (e.g., 1.0.0)'),
  
  body('dataPoints')
    .optional()
    .isArray()
    .withMessage('dataPoints must be an array'),
  
  body('dataPoints.*.label')
    .optional()
    .isString()
    .isLength({ min: 1 })
    .withMessage('Data point label must be a non-empty string'),
  
  body('dataPoints.*.value')
    .optional()
    .custom((value) => {
      if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
        throw new Error('Data point value must be string, number, or boolean');
      }
      return true;
    }),
  
  body('scenes')
    .optional()
    .isArray()
    .withMessage('scenes must be an array'),
  
  body('scenes.*.time')
    .optional()
    .matches(/^\d{1,2}:\d{2}(:\d{2})?(-\d{1,2}:\d{2}(:\d{2})?)?$/)
    .withMessage('Scene time must be in format MM:SS or HH:MM:SS or range'),
  
  body('scenes.*.description')
    .optional()
    .isString()
    .isLength({ min: 1 })
    .withMessage('Scene description must be a non-empty string'),
  
  body('accessibilityFeatures')
    .optional()
    .isArray()
    .withMessage('accessibilityFeatures must be an array'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('tags must be an array'),
  
  body('metadataURI')
    .optional()
    .isURL()
    .withMessage('metadataURI must be a valid URL'),
];

/**
 * Validate query parameters for listing metadata
 */
export const validateListQuery = [
  query('type')
    .optional()
    .isIn(['image', 'video', 'audio', 'ui-element', 'document'])
    .withMessage('type must be one of: image, video, audio, ui-element, document'),
  
  query('tags')
    .optional()
    .isString()
    .withMessage('tags must be a comma-separated string'),
  
  query('features')
    .optional()
    .isString()
    .withMessage('features must be a comma-separated string'),
  
  query('createdAfter')
    .optional()
    .isISO8601()
    .withMessage('createdAfter must be a valid ISO8601 date'),
  
  query('createdBefore')
    .optional()
    .isISO8601()
    .withMessage('createdBefore must be a valid ISO8601 date'),
  
  query('hasDataPoints')
    .optional()
    .isBoolean()
    .withMessage('hasDataPoints must be true or false'),
  
  query('language')
    .optional()
    .matches(/^[a-z]{2}(-[A-Z]{2})?$/)
    .withMessage('language must be a valid BCP 47 language tag (e.g., en, en-US)'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('offset must be non-negative'),
];

/**
 * Validate EAMP metadata using Zod schema
 */
export const validateEAMPMetadata = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate using the EAMP schema
    const validatedData = EAMPMetadataSchema.parse(req.body);
    
    // Replace body with validated data
    req.body = validatedData;
    
    next();
  } catch (error: any) {
    logger.warn(`EAMP schema validation failed: ${error.message}`);
    
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid EAMP metadata format',
        details: error.errors || [error.message],
      },
    });
  }
};

/**
 * Parse query parameters for metadata listing
 */
export const parseListQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};
    
    if (req.query.type) {
      filter.type = req.query.type as ContentType;
    }
    
    if (req.query.tags) {
      filter.tags = (req.query.tags as string).split(',').map(tag => tag.trim());
    }
    
    if (req.query.features) {
      filter.accessibilityFeatures = (req.query.features as string)
        .split(',')
        .map(feature => feature.trim());
    }
    
    if (req.query.createdAfter) {
      filter.createdAfter = req.query.createdAfter as string;
    }
    
    if (req.query.createdBefore) {
      filter.createdBefore = req.query.createdBefore as string;
    }
    
    if (req.query.hasDataPoints !== undefined) {
      filter.hasDataPoints = req.query.hasDataPoints === 'true';
    }
    
    if (req.query.language) {
      filter.language = req.query.language as string;
    }
    
    if (req.query.limit) {
      filter.limit = parseInt(req.query.limit as string, 10);
    }
    
    if (req.query.offset) {
      filter.offset = parseInt(req.query.offset as string, 10);
    }
    
    // Attach parsed filter to request
    (req as any).filter = filter;
    
    next();
  } catch (error) {
    logger.error(`Error parsing query parameters: ${error}`);
    
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid query parameters',
      },
    });
  }
};