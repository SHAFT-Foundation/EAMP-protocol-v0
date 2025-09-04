# EAMP React SDK

React hooks and components for the Extended Accessibility Metadata Protocol (EAMP).

## Installation

```bash
npm install @eamp/react-sdk @eamp/javascript-sdk
# or
yarn add @eamp/react-sdk @eamp/javascript-sdk
# or
pnpm add @eamp/react-sdk @eamp/javascript-sdk
```

## Quick Start

### Setup Provider

```tsx
import { EAMPProvider } from '@eamp/react-sdk';

function App() {
  return (
    <EAMPProvider
      clientOptions={{
        baseURL: 'https://api.example.com',
        cacheEnabled: true
      }}
    >
      <MyAccessibleApp />
    </EAMPProvider>
  );
}
```

### Use Metadata Hook

```tsx
import { useEAMPMetadata } from '@eamp/react-sdk';

function AccessibleImage({ src, resourceId }: { src: string; resourceId: string }) {
  const { metadata, loading, error } = useEAMPMetadata(resourceId);

  if (loading) return <img src={src} alt="Loading accessibility information..." />;
  if (error) return <img src={src} alt="Image" />;

  return (
    <div>
      <img 
        src={src} 
        alt={metadata?.shortAlt || 'Image'}
        aria-describedby={metadata?.extendedDescription ? 'extended-desc' : undefined}
      />
      
      {metadata?.extendedDescription && (
        <div id="extended-desc" className="sr-only">
          {metadata.extendedDescription}
        </div>
      )}
      
      {metadata?.dataPoints && (
        <AccessibleDataTable dataPoints={metadata.dataPoints} />
      )}
    </div>
  );
}
```

## Hooks

### useEAMPMetadata

Get metadata for a specific resource with automatic caching and updates.

```tsx
const { metadata, loading, error, refetch } = useEAMPMetadata(resourceId, options);
```

**Parameters:**
- `resourceId: string` - The resource identifier
- `options?: MetadataOptions` - Optional configuration

**Returns:**
- `metadata: EAMPMetadata | null` - The metadata object
- `loading: boolean` - Loading state
- `error: Error | null` - Error state
- `refetch: () => void` - Manually refetch metadata

### useEAMPSubscription

Subscribe to real-time metadata updates.

```tsx
const { isSubscribed, subscribe, unsubscribe } = useEAMPSubscription(resourceId);

// Subscribe on mount
useEffect(() => {
  subscribe();
  return () => unsubscribe();
}, [subscribe, unsubscribe]);
```

### useEAMPClient

Access the underlying EAMP client instance.

```tsx
const client = useEAMPClient();

const handleCustomOperation = useCallback(async () => {
  const metadata = await client.getMetadata('custom-resource');
  // Handle metadata
}, [client]);
```

## Components

### AccessibleImage

Enhanced image component with automatic EAMP integration.

```tsx
<AccessibleImage
  src="/chart.png"
  resourceId="sales-chart-2024"
  fallbackAlt="Sales chart"
  showDataPoints={true}
  showExtendedDescription={true}
  onMetadataLoad={(metadata) => console.log('Loaded:', metadata)}
/>
```

**Props:**
- `src: string` - Image source URL
- `resourceId: string` - EAMP resource identifier  
- `fallbackAlt?: string` - Fallback alt text if EAMP fails
- `showDataPoints?: boolean` - Whether to render data points
- `showExtendedDescription?: boolean` - Whether to show extended description
- `onMetadataLoad?: (metadata: EAMPMetadata) => void` - Callback when metadata loads

### AccessibleVideo

Video component with EAMP-powered captions and scene descriptions.

```tsx
<AccessibleVideo
  src="/demo.mp4"
  resourceId="product-demo"
  showScenes={true}
  showTranscript={true}
  autoDescribe={true}
/>
```

### AccessibleDataTable

Render data points as an accessible table.

```tsx
<AccessibleDataTable
  dataPoints={metadata.dataPoints}
  caption="Sales data by quarter"
  sortable={true}
/>
```

### MetadataDebugger

Development component to inspect EAMP metadata.

```tsx
{process.env.NODE_ENV === 'development' && (
  <MetadataDebugger resourceId="debug-resource" />
)}
```

## Advanced Usage

### Custom Hook with Caching

```tsx
function useAccessibleChart(chartId: string) {
  const { metadata, loading } = useEAMPMetadata(`charts/${chartId}`, {
    cacheTimeout: 300000, // 5 minutes
    enableRealTimeUpdates: true
  });

  const chartData = useMemo(() => {
    if (!metadata?.dataPoints) return null;
    
    return metadata.dataPoints.map(point => ({
      label: point.label,
      value: Number(point.value),
      unit: point.unit
    }));
  }, [metadata]);

  const announceData = useCallback(() => {
    if (metadata?.extendedDescription) {
      // Announce to screen reader
      const announcement = new SpeechSynthesisUtterance(metadata.extendedDescription);
      speechSynthesis.speak(announcement);
    }
  }, [metadata]);

  return { chartData, announceData, loading };
}
```

### Multi-language Support

```tsx
function AccessibleImageI18n({ resourceId, locale }: { resourceId: string; locale: string }) {
  const { metadata } = useEAMPMetadata(resourceId);
  
  const localizedAlt = metadata?.[`shortAlt_${locale}`] || metadata?.shortAlt;
  const localizedDescription = metadata?.[`extendedDescription_${locale}`] || metadata?.extendedDescription;
  
  return (
    <div>
      <img alt={localizedAlt} aria-describedby="desc" />
      <div id="desc" className="sr-only">
        {localizedDescription}
      </div>
    </div>
  );
}
```

### Error Boundaries

```tsx
import { EAMPErrorBoundary } from '@eamp/react-sdk';

function App() {
  return (
    <EAMPProvider>
      <EAMPErrorBoundary
        fallback={({ error, resetError }) => (
          <div>
            <h2>Accessibility metadata unavailable</h2>
            <p>Using fallback accessibility features.</p>
            <button onClick={resetError}>Retry</button>
          </div>
        )}
      >
        <AccessibleContent />
      </EAMPErrorBoundary>
    </EAMPProvider>
  );
}
```

## Testing

### Testing with Mock Data

```tsx
import { render } from '@testing-library/react';
import { EAMPProvider } from '@eamp/react-sdk';
import { createMockClient } from '@eamp/test-utils';

const mockClient = createMockClient({
  'test-resource': {
    id: 'test-resource',
    type: 'image',
    shortAlt: 'Test alt text',
    extendedDescription: 'Detailed test description'
  }
});

function renderWithEAMP(component: React.ReactElement) {
  return render(
    <EAMPProvider client={mockClient}>
      {component}
    </EAMPProvider>
  );
}

test('should render accessible image with EAMP metadata', async () => {
  const { getByRole, findByText } = renderWithEAMP(
    <AccessibleImage src="/test.png" resourceId="test-resource" />
  );
  
  const img = getByRole('img');
  expect(img).toHaveAttribute('alt', 'Test alt text');
  
  const description = await findByText('Detailed test description');
  expect(description).toBeInTheDocument();
});
```

## Performance Considerations

### Lazy Loading

```tsx
import { lazy, Suspense } from 'react';

const AccessibleChart = lazy(() => import('./AccessibleChart'));

function ChartSection({ chartId }: { chartId: string }) {
  return (
    <Suspense fallback={<div>Loading accessible chart...</div>}>
      <AccessibleChart resourceId={`charts/${chartId}`} />
    </Suspense>
  );
}
```

### Memoization

```tsx
const AccessibleImage = memo(({ src, resourceId }: AccessibleImageProps) => {
  const { metadata } = useEAMPMetadata(resourceId);
  
  return useMemo(() => (
    <img 
      src={src} 
      alt={metadata?.shortAlt || 'Image'}
      key={`${resourceId}-${metadata?.shortAlt}`}
    />
  ), [src, resourceId, metadata?.shortAlt]);
});
```

## TypeScript Support

Full TypeScript definitions are included:

```tsx
interface EAMPMetadata {
  id: string;
  type: 'image' | 'video' | 'audio' | 'ui-element' | 'document';
  shortAlt: string;
  extendedDescription: string;
  // ... other fields
}

interface UseEAMPMetadataResult {
  metadata: EAMPMetadata | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}
```

## Contributing

See the main [Contributing Guide](../../CONTRIBUTING.md) for details.

## License

MIT - see [LICENSE](../../LICENSE) for details.

---

Built with ❤️ by [Shaft Finance](https://shaft.finance) for accessible React applications.