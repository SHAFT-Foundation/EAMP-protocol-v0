# EAMP Node.js Express Reference Server

A complete reference implementation of an EAMP (Extended Accessibility Metadata Protocol) server built with Node.js and Express.js.

## Features

- **Full CRUD Operations**: Create, read, update, and delete EAMP metadata
- **Real-time Updates**: WebSocket support for live metadata changes
- **Data Validation**: Comprehensive validation using Zod schemas
- **Caching**: In-memory caching with TTL support
- **Rate Limiting**: Protection against abuse
- **Security**: CORS, Helmet, and optional API key authentication
- **Database**: SQLite with better-sqlite3 for performance
- **Monitoring**: Prometheus-style metrics endpoint
- **Sample Data**: Pre-loaded sample metadata for development

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Build the project
npm run build

# Start in development mode
npm run dev
```

The server will start at `http://localhost:3000` by default.

### Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

### Metadata Operations

- `GET /metadata` - List all metadata with optional filtering
- `GET /metadata/:resourceId` - Get specific metadata by ID
- `POST /metadata` - Create new metadata
- `PUT /metadata/:resourceId` - Update existing metadata
- `PATCH /metadata/:resourceId` - Partially update metadata
- `DELETE /metadata/:resourceId` - Delete metadata

### System Endpoints

- `GET /health` - Health check endpoint
- `GET /info` - Server information and statistics
- `GET /metrics` - Prometheus-style metrics (if enabled)

### WebSocket

- `WS /ws` - WebSocket connection for real-time updates

## WebSocket Usage

Connect to `/ws` and send subscription messages:

```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

// Subscribe to metadata updates
ws.send(JSON.stringify({
  type: 'subscribe',
  resourceId: 'sales-chart-2024'
}));

// Listen for updates
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'metadata_updated') {
    console.log('Metadata updated:', message);
  }
};
```

## Environment Configuration

Key environment variables (see `.env.example`):

```bash
# Server
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_PATH=./data/metadata.db

# Authentication (optional)
API_KEY_HEADER=X-API-Key
VALID_API_KEYS=your-key-1,your-key-2

# Features
ENABLE_METRICS=true
WS_MAX_CONNECTIONS=1000
```

## Sample Data

In development mode, the server automatically loads sample metadata including:

- **sales-chart-2024**: Quarterly sales visualization
- **cooking-tutorial-pasta**: Video tutorial with transcript
- **submit-button-checkout**: UI element metadata
- **population-growth-chart**: Historical data visualization
- **product-sneakers-red**: Product image metadata
- **news-climate-report**: Document metadata

## Testing with JavaScript SDK

```javascript
import { EAMPClient } from '@eamp/javascript-sdk';

const client = new EAMPClient({
  baseUrl: 'http://localhost:3000',
  apiKey: 'your-api-key' // if authentication enabled
});

// Get metadata
const metadata = await client.getMetadata('sales-chart-2024');
console.log(metadata);

// List all metadata
const allMetadata = await client.listMetadata();
console.log(allMetadata);
```

## Development Scripts

```bash
npm run dev        # Start development server with hot reload
npm run build      # Build TypeScript to JavaScript
npm start          # Start production server
npm run lint       # Run ESLint
npm run type-check # Run TypeScript type checking
npm test           # Run test suite
```

## Architecture

```
src/
├── app.ts              # Express app configuration
├── index.ts            # Server entry point
├── config/             # Environment configuration
├── routes/             # API route handlers
├── services/           # Business logic (database, websocket)
├── middleware/         # Custom middleware (validation, etc.)
└── utils/              # Utilities (logging, sample data)
```

## Database Schema

The SQLite database stores EAMP metadata with these fields:

- `id` (TEXT PRIMARY KEY) - Resource identifier
- `type` (TEXT) - Content type (image, video, audio, etc.)
- `eamp_version` (TEXT) - EAMP protocol version
- `short_alt` (TEXT) - Brief alternative text
- `extended_description` (TEXT) - Detailed description
- `data_points` (TEXT JSON) - Structured data points
- `visual_elements` (TEXT JSON) - Visual element descriptions
- `accessibility_features` (TEXT JSON) - Accessibility features
- `tags` (TEXT JSON) - Content tags
- `context` (TEXT JSON) - Contextual information
- `transcript` (TEXT) - Media transcript
- `scenes` (TEXT JSON) - Video/audio scene data
- `created_at` (DATETIME) - Creation timestamp
- `updated_at` (DATETIME) - Last update timestamp

## Security

- **CORS**: Configurable allowed origins
- **Helmet**: Security headers
- **Rate Limiting**: Prevent abuse
- **API Keys**: Optional authentication
- **Input Validation**: Comprehensive request validation

## Monitoring

When `ENABLE_METRICS=true`, the `/metrics` endpoint provides:

- Request counts and cache statistics
- WebSocket connection metrics
- Database operation counters
- Response time histograms

## Contributing

This is a reference implementation. For production use:

1. Configure proper authentication
2. Set up database backups
3. Add comprehensive logging
4. Implement proper error monitoring
5. Configure load balancing if needed

## License

Part of the EAMP Protocol implementation. See main repository for license information.