# EAMP JavaScript SDK

The official JavaScript/TypeScript SDK for the Extended Accessibility Metadata Protocol (EAMP).

## Installation

```bash
npm install @eamp/javascript-sdk
# or
yarn add @eamp/javascript-sdk
# or  
pnpm add @eamp/javascript-sdk
```

## Quick Start

### Client Usage

```typescript
import { EAMPClient } from '@eamp/javascript-sdk';

const client = new EAMPClient();

// Get metadata for a resource
const metadata = await client.getMetadata('https://example.com/chart.png');
console.log(metadata.extendedDescription);

// Listen for metadata updates
client.on('metadataUpdated', (update) => {
  console.log('Metadata updated:', update);
});
```

### Server Usage

```typescript
import { EAMPServer, createHttpTransport } from '@eamp/javascript-sdk';

const server = new EAMPServer({
  name: 'MyApp Accessibility Server',
  version: '1.0.0'
});

// Register metadata provider
server.setMetadataProvider(async (resourceId) => {
  return {
    id: resourceId,
    type: 'image',
    shortAlt: 'Sales chart for Q4 2024',
    extendedDescription: 'Detailed quarterly sales data...',
    dataPoints: [
      { label: 'Q1', value: 1200000, unit: 'USD' },
      { label: 'Q2', value: 1500000, unit: 'USD' }
    ],
    accessibilityFeatures: ['high-contrast', 'screen-reader-optimized']
  };
});

// Start server
const transport = createHttpTransport({ port: 3000 });
await server.connect(transport);
```

## Features

- ✅ Full EAMP v1.0 protocol support
- ✅ TypeScript definitions included
- ✅ Multiple transport layers (HTTP, WebSocket)
- ✅ Real-time metadata updates
- ✅ Built-in validation
- ✅ Caching and performance optimization
- ✅ Error handling and retry logic
- ✅ Web3 integration (IPFS, Arweave)

## API Reference

### EAMPClient

#### Constructor

```typescript
new EAMPClient(options?: ClientOptions)
```

#### Methods

- `getMetadata(resourceId: string): Promise<EAMPMetadata>`
- `listMetadata(filter?: MetadataFilter): Promise<EAMPMetadata[]>`
- `subscribe(resourceId: string): Promise<void>`
- `unsubscribe(resourceId: string): Promise<void>`

### EAMPServer

#### Constructor

```typescript
new EAMPServer(serverInfo: ServerInfo)
```

#### Methods

- `setMetadataProvider(provider: MetadataProvider): void`
- `connect(transport: Transport): Promise<void>`
- `disconnect(): Promise<void>`
- `notifyMetadataChanged(resourceId: string): void`

### Types

```typescript
interface EAMPMetadata {
  id: string;
  type: 'image' | 'video' | 'audio' | 'ui-element' | 'document';
  eampVersion: string;
  shortAlt: string;
  extendedDescription: string;
  dataPoints?: DataPoint[];
  transcript?: string;
  scenes?: Scene[];
  accessibilityFeatures?: string[];
  tags?: string[];
  sourceAttribution?: string;
  metadataURI?: string;
}

interface DataPoint {
  label: string;
  value: string | number | boolean;
  unit?: string;
}

interface Scene {
  time: string;
  description: string;
}
```

## Examples

### Basic Image Metadata

```typescript
const imageMetadata = await client.getMetadata('https://example.com/chart.png');

if (imageMetadata.type === 'image') {
  // Announce short description immediately
  announceToScreenReader(imageMetadata.shortAlt);
  
  // Provide detailed description on request
  if (userRequestsDetails()) {
    announceToScreenReader(imageMetadata.extendedDescription);
    
    // Read data points if available
    if (imageMetadata.dataPoints) {
      for (const point of imageMetadata.dataPoints) {
        announceToScreenReader(`${point.label}: ${point.value} ${point.unit || ''}`);
      }
    }
  }
}
```

### Video with Scenes

```typescript
const videoMetadata = await client.getMetadata('https://example.com/demo.mp4');

if (videoMetadata.type === 'video' && videoMetadata.scenes) {
  // Provide scene-by-scene navigation
  for (const scene of videoMetadata.scenes) {
    console.log(`${scene.time}: ${scene.description}`);
  }
}
```

### Real-time Updates

```typescript
// Subscribe to metadata changes
await client.subscribe('https://example.com/live-chart.png');

client.on('metadataUpdated', ({ resourceId, metadata }) => {
  if (resourceId === 'https://example.com/live-chart.png') {
    updateAccessibilityDescription(metadata);
  }
});
```

## Configuration

### Client Options

```typescript
interface ClientOptions {
  baseURL?: string;
  timeout?: number;
  retryAttempts?: number;
  cacheEnabled?: boolean;
  cacheTTL?: number;
  userAgent?: string;
}
```

### Server Options

```typescript
interface ServerInfo {
  name: string;
  version: string;
  description?: string;
  capabilities?: ServerCapabilities;
}

interface ServerCapabilities {
  realTimeUpdates?: boolean;
  dataPoints?: boolean;
  multiLanguage?: boolean;
  web3Support?: boolean;
}
```

## Error Handling

```typescript
try {
  const metadata = await client.getMetadata('invalid-resource');
} catch (error) {
  if (error instanceof EAMPError) {
    console.error('EAMP Error:', error.code, error.message);
    
    switch (error.code) {
      case 'RESOURCE_NOT_FOUND':
        // Handle missing metadata
        break;
      case 'VALIDATION_ERROR':
        // Handle invalid data
        break;
      case 'NETWORK_ERROR':
        // Handle connection issues
        break;
    }
  }
}
```

## Testing

```bash
npm test           # Run all tests
npm run test:unit  # Unit tests only
npm run test:e2e   # End-to-end tests
```

## Contributing

See the main [Contributing Guide](../../CONTRIBUTING.md) for details on how to contribute to this SDK.

## License

MIT - see [LICENSE](../../LICENSE) for details.

---

Built with ❤️ by [Shaft Finance](https://shaft.finance) for the accessibility community.