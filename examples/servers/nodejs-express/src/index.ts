import { createServer } from 'http';
import { createApp, AppDependencies } from './app.js';
import { MetadataDatabase } from './services/database.js';
import { WebSocketManager } from './services/websocket.js';
import NodeCache from 'node-cache';
import config from './config/index.js';
import logger from './utils/logger.js';
import { initializeSampleData } from './utils/sampleData.js';

async function startServer(): Promise<void> {
  try {
    // Initialize database
    logger.info('Initializing database...');
    const database = new MetadataDatabase();
    
    // Initialize cache
    const cache = new NodeCache({
      stdTTL: config.cache.ttl,
      maxKeys: config.cache.maxSize,
    });

    // Create HTTP server
    const dependencies: AppDependencies = { database, cache };
    const app = createApp(dependencies);
    const server = createServer(app);

    // Initialize WebSocket manager
    logger.info('Initializing WebSocket manager...');
    const wsManager = new WebSocketManager(server);
    dependencies.wsManager = wsManager;

    // Initialize sample data in development
    if (config.server.env === 'development') {
      logger.info('Loading sample data...');
      await initializeSampleData(database, wsManager);
    }

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      server.close(() => {
        logger.info('HTTP server closed');
      });

      if (wsManager) {
        wsManager.close();
      }

      database.close();
      
      logger.info('Graceful shutdown completed');
      process.exit(0);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught exception:', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
      logger.error('Unhandled promise rejection:', { reason, promise });
    });

    // Start server
    server.listen(config.server.port, config.server.host, () => {
      logger.info(`🚀 EAMP Reference Server started successfully!`);
      logger.info(`📍 Server: http://${config.server.host}:${config.server.port}`);
      logger.info(`🔌 WebSocket: ws://${config.server.host}:${config.server.port}/ws`);
      logger.info(`📊 Health: http://${config.server.host}:${config.server.port}/health`);
      logger.info(`ℹ️  Info: http://${config.server.host}:${config.server.port}/info`);
      logger.info(`🌍 Environment: ${config.server.env}`);
      
      if (config.api.keyHeader) {
        logger.info(`🔐 API Key authentication enabled (${config.api.keyHeader})`);
      }
      
      if (config.monitoring.enabled) {
        logger.info(`📈 Metrics: http://${config.server.host}:${config.server.port}${config.monitoring.endpoint}`);
      }
      
      logger.info('Ready to serve EAMP metadata! 🎯');
    });

    server.on('error', (error: Error) => {
      logger.error('Server error:', error);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  startServer();
}

export { startServer };