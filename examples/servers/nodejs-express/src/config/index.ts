import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../../.env') });

export interface AppConfig {
  server: {
    port: number;
    host: string;
    env: string;
  };
  database: {
    path: string;
  };
  cache: {
    ttl: number;
    maxSize: number;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  cors: {
    allowedOrigins: string[];
  };
  logging: {
    level: string;
    format: string;
  };
  websocket: {
    heartbeatInterval: number;
    maxConnections: number;
  };
  api: {
    keyHeader?: string;
    validKeys: string[];
  };
  monitoring: {
    enabled: boolean;
    endpoint: string;
  };
}

const appConfig: AppConfig = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    path: process.env.DATABASE_PATH || './data/metadata.db',
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '300', 10),
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000', 10),
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
  },
  websocket: {
    heartbeatInterval: parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000', 10),
    maxConnections: parseInt(process.env.WS_MAX_CONNECTIONS || '1000', 10),
  },
  api: {
    keyHeader: process.env.API_KEY_HEADER,
    validKeys: process.env.VALID_API_KEYS?.split(',') || [],
  },
  monitoring: {
    enabled: process.env.ENABLE_METRICS === 'true',
    endpoint: process.env.METRICS_ENDPOINT || '/metrics',
  },
};

export default appConfig;