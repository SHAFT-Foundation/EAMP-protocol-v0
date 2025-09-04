import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import NodeCache from 'node-cache';
import { createMetadataRoutes } from './routes/metadata.js';
import { MetadataDatabase } from './services/database.js';
import { WebSocketManager } from './services/websocket.js';
import config from './config/index.js';
import logger from './utils/logger.js';

export interface AppDependencies {
  database: MetadataDatabase;
  cache: NodeCache;
  wsManager?: WebSocketManager;
}

export function createApp(dependencies: AppDependencies): express.Application {
  const app = express();
  const { database, cache } = dependencies;

  // Trust proxy for accurate IP addresses
  app.set('trust proxy', true);

  // Security middleware
  app.use(helmet({
    crossOriginEmbedderPolicy: false, // Allow embedding for accessibility tools
    contentSecurityPolicy: false, // Allow inline styles for accessibility
  }));

  // CORS configuration
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (config.cors.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Allow localhost in development
      if (config.server.env === 'development' && origin.includes('localhost')) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-API-Key'],
    exposedHeaders: ['X-Total-Count', 'ETag', 'Cache-Control'],
  }));

  // Compression
  app.use(compression());

  // Request logging
  const logFormat = config.server.env === 'production' ? 'combined' : 'dev';
  app.use(morgan(logFormat, {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      },
    },
    skip: (req: Request) => {
      // Skip health check and WebSocket upgrade requests
      return req.url === '/health' || req.headers.upgrade === 'websocket';
    },
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
      },
    },
    skip: (req: Request) => {
      // Skip rate limiting for health checks and WebSocket
      return req.url === '/health' || req.headers.upgrade === 'websocket';
    },
  });
  app.use(limiter);

  // Body parsing
  app.use(express.json({ 
    limit: '10mb',
    type: ['application/json', 'application/eamp+json'],
  }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API key authentication middleware (if enabled)
  if (config.api.keyHeader && config.api.validKeys.length > 0) {
    app.use('/metadata', (req: Request, res: Response, next: NextFunction) => {
      // Skip authentication for GET requests in development
      if (config.server.env === 'development' && req.method === 'GET') {
        return next();
      }

      const apiKey = req.header(config.api.keyHeader!);
      
      if (!apiKey || !config.api.validKeys.includes(apiKey)) {
        return res.status(401).json({
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'Valid API key required',
          },
        });
      }
      
      next();
    });
  }

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      environment: config.server.env,
    });
  });

  // API info endpoint
  app.get('/info', async (req: Request, res: Response) => {
    try {
      const stats = await database.getStats();
      const wsStats = dependencies.wsManager?.getStats() || null;
      
      res.json({
        server: {
          name: 'EAMP Reference Server',
          version: '1.0.0',
          description: 'Node.js Express reference implementation for EAMP protocol',
          environment: config.server.env,
        },
        capabilities: {
          realTimeUpdates: !!dependencies.wsManager,
          dataPoints: true,
          multiLanguage: true,
          web3Support: false,
        },
        statistics: {
          database: stats,
          websocket: wsStats,
          cache: {
            keys: cache.keys().length,
            size: cache.getStats().keys,
          },
        },
      });
    } catch (error) {
      logger.error(`Error getting server info: ${error}`);
      res.status(500).json({
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to retrieve server information',
        },
      });
    }
  });

  // Metadata routes
  app.use('/metadata', createMetadataRoutes(database));

  // Monitoring endpoint (if enabled)
  if (config.monitoring.enabled) {
    app.get(config.monitoring.endpoint, (req: Request, res: Response) => {
      const stats = cache.getStats();
      const wsStats = dependencies.wsManager?.getStats();
      
      res.set('Content-Type', 'text/plain');
      res.send(`
# HELP eamp_requests_total Total number of requests
# TYPE eamp_requests_total counter
eamp_requests_total ${stats.hits + stats.misses}

# HELP eamp_cache_hits_total Total number of cache hits
# TYPE eamp_cache_hits_total counter
eamp_cache_hits_total ${stats.hits}

# HELP eamp_cache_misses_total Total number of cache misses
# TYPE eamp_cache_misses_total counter  
eamp_cache_misses_total ${stats.misses}

# HELP eamp_websocket_connections Current WebSocket connections
# TYPE eamp_websocket_connections gauge
eamp_websocket_connections ${wsStats?.connectedClients || 0}

# HELP eamp_websocket_subscriptions Current WebSocket subscriptions
# TYPE eamp_websocket_subscriptions gauge
eamp_websocket_subscriptions ${wsStats?.totalSubscriptions || 0}
      `.trim());
    });
  }

  // 404 handler
  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
      },
    });
  });

  // Global error handler
  app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Unhandled error: ${error.message}`, { 
      stack: error.stack,
      url: req.url,
      method: req.method,
    });

    // Don't leak error details in production
    const message = config.server.env === 'production' 
      ? 'Internal server error' 
      : error.message;

    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message,
      },
    });
  });

  return app;
}