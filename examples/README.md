# EAMP Examples

This directory contains reference implementations and examples for the Extended Accessibility Metadata Protocol (EAMP).

## 📁 Directory Structure

### 🔧 [Servers](./servers/)
Reference implementations of EAMP servers in various languages and frameworks:
- **[Node.js Express Server](./servers/nodejs-express/)** - Basic HTTP server
- **[Python FastAPI Server](./servers/python-fastapi/)** - Advanced server with database
- **[Next.js API Routes](./servers/nextjs-api/)** - Serverless implementation
- **[Web3 IPFS Server](./servers/web3-ipfs/)** - Decentralized metadata server

### 💻 [Clients](./clients/)
Example applications that consume EAMP metadata:
- **[React Web App](./clients/react-web-app/)** - Web application with EAMP integration
- **[Screen Reader Extension](./clients/screen-reader-extension/)** - Browser extension
- **[Mobile App](./clients/mobile-app/)** - React Native mobile application
- **[AI Agent](./clients/ai-agent/)** - AI agent for content evaluation

## 🚀 Quick Start

### Running a Server Example

```bash
# Node.js Express Server
cd examples/servers/nodejs-express
npm install
npm start

# Python FastAPI Server  
cd examples/servers/python-fastapi
pip install -r requirements.txt
uvicorn main:app --reload

# Next.js API Routes
cd examples/servers/nextjs-api
npm install
npm run dev
```

### Running a Client Example

```bash
# React Web App
cd examples/clients/react-web-app
npm install
npm start

# AI Agent
cd examples/clients/ai-agent
pip install -r requirements.txt
python agent.py
```

## 📊 Example Scenarios

### Scenario 1: E-commerce Product Images

**Context**: Online store with product images that need rich accessibility metadata.

**Server Implementation**: [E-commerce API Server](./servers/ecommerce-api/)
```json
{
  "id": "product-shoe-123",
  "type": "image",
  "shortAlt": "Red running shoes",
  "extendedDescription": "Bright red athletic running shoes with white sole and black accents. Features mesh upper for breathability and cushioned midsole for comfort.",
  "dataPoints": [
    {"label": "Brand", "value": "Nike"},
    {"label": "Size Range", "value": "6-12 US"},
    {"label": "Price", "value": 129.99, "unit": "USD"},
    {"label": "Colors Available", "value": "Red, Blue, Black"}
  ],
  "tags": ["footwear", "running", "athletic", "nike"],
  "accessibilityFeatures": ["high-contrast", "zoom-friendly"]
}
```

**Client Integration**: 
- Screen readers announce price and availability
- AI shopping agents compare features across products
- Voice assistants provide detailed product descriptions

### Scenario 2: Educational Data Visualizations

**Context**: Learning management system with interactive charts and graphs.

**Server Implementation**: [Educational Charts API](./servers/education-api/)
```json
{
  "id": "population-growth-chart",
  "type": "image", 
  "shortAlt": "World population growth 1900-2020",
  "extendedDescription": "Line chart showing exponential world population growth from 1.6 billion in 1900 to 7.8 billion in 2020. Steepest growth occurred between 1950-2000.",
  "dataPoints": [
    {"label": "1900", "value": 1600000000, "unit": "people"},
    {"label": "1950", "value": 2500000000, "unit": "people"},
    {"label": "2000", "value": 6100000000, "unit": "people"},
    {"label": "2020", "value": 7800000000, "unit": "people"}
  ],
  "visualElements": [
    {"type": "chart", "description": "Blue line graph with exponential curve"},
    {"type": "text", "description": "Y-axis shows population in billions"},
    {"type": "text", "description": "X-axis shows years from 1900 to 2020"}
  ],
  "context": {
    "pageTitle": "Demographics - World History Course",
    "sectionHeading": "Population Trends", 
    "purpose": "Illustrate exponential population growth pattern"
  },
  "tags": ["education", "demographics", "history", "statistics"]
}
```

**Client Integration**:
- Students with visual impairments access data through screen readers
- AI tutors explain trends and patterns
- Interactive exploration of data points

### Scenario 3: Video Content Platform

**Context**: Video streaming platform with enhanced accessibility.

**Server Implementation**: [Video Platform API](./servers/video-platform/)
```json
{
  "id": "cooking-tutorial-pasta",
  "type": "video",
  "shortAlt": "Cooking tutorial: Making fresh pasta",
  "extendedDescription": "Step-by-step cooking tutorial showing how to make fresh pasta from scratch, including mixing dough, kneading, rolling, and cutting.",
  "transcript": "Chef Maria: Hello everyone, today we're making fresh pasta...",
  "scenes": [
    {
      "time": "0:00-0:30",
      "description": "Introduction with chef in bright kitchen",
      "speakers": ["Chef Maria"],
      "visualElements": ["kitchen counter", "pasta ingredients"],
      "audioElements": ["upbeat background music"]
    },
    {
      "time": "0:31-2:15", 
      "description": "Mixing flour and eggs in large bowl",
      "speakers": ["Chef Maria"],
      "visualElements": ["mixing bowl", "flour", "eggs", "hands kneading"],
      "audioElements": ["mixing sounds", "chef narration"]
    }
  ],
  "accessibilityFeatures": ["captions", "audio-descriptions"],
  "tags": ["cooking", "tutorial", "pasta", "italian-cuisine"]
}
```

**Client Integration**:
- Enhanced screen reader support with scene descriptions
- AI-powered cooking assistants understand recipe steps
- Voice-controlled navigation through video segments

## 🛠️ Development Tools

### Testing Your Implementation

Each example includes comprehensive tests:

```bash
# Run server tests
cd examples/servers/nodejs-express
npm test

# Run client tests  
cd examples/clients/react-web-app
npm test

# Run integration tests
npm run test:integration
```

### Validation Tools

```bash
# Validate metadata against EAMP schema
cd tools/validator
node validate.js path/to/metadata.json

# Test server compliance
cd tools/server-test
python test_server.py http://localhost:3000
```

### Performance Testing

```bash
# Load testing
cd tools/performance
npm install
npm run load-test -- --url http://localhost:3000/eamp

# Cache testing
npm run cache-test
```

## 🔍 Implementation Patterns

### Server-Side Patterns

#### Database Integration
```javascript
// MongoDB example
app.get('/eamp/:resourceId', async (req, res) => {
  const metadata = await MetadataModel.findOne({
    resourceId: req.params.resourceId
  });
  
  if (!metadata) {
    return res.status(404).json({
      error: "Resource not found"
    });
  }
  
  res.json(metadata.toEAMPFormat());
});
```

#### Caching Strategy
```javascript
// Redis caching
const redis = require('redis');
const client = redis.createClient();

app.get('/eamp/:resourceId', async (req, res) => {
  const cacheKey = `eamp:${req.params.resourceId}`;
  
  // Check cache first
  const cached = await client.get(cacheKey);
  if (cached) {
    res.set('X-Cache', 'HIT');
    return res.json(JSON.parse(cached));
  }
  
  // Generate metadata
  const metadata = await generateMetadata(req.params.resourceId);
  
  // Cache for 1 hour
  await client.setex(cacheKey, 3600, JSON.stringify(metadata));
  
  res.set('X-Cache', 'MISS');
  res.json(metadata);
});
```

### Client-Side Patterns

#### Progressive Enhancement
```javascript
// Enhance existing content with EAMP
async function enhanceAccessibility(element) {
  const metadataUrl = element.dataset.eampMetadata;
  if (!metadataUrl) return;
  
  try {
    const response = await fetch(metadataUrl);
    const metadata = await response.json();
    
    // Enhance existing alt text
    if (metadata.extendedDescription) {
      element.setAttribute('aria-describedby', 'eamp-description');
      createDescriptionElement(element, metadata.extendedDescription);
    }
    
    // Add data table for charts
    if (metadata.dataPoints) {
      createDataTable(element, metadata.dataPoints);
    }
    
  } catch (error) {
    console.warn('EAMP enhancement failed:', error);
    // Graceful degradation - continue with original accessibility
  }
}
```

#### Real-time Updates
```javascript
// WebSocket updates
const ws = new WebSocket('wss://api.example.com/eamp/updates');

ws.addEventListener('message', (event) => {
  const update = JSON.parse(event.data);
  
  if (update.type === 'metadata_updated') {
    refreshMetadata(update.resourceId);
  }
});

// Subscribe to specific resource updates
ws.send(JSON.stringify({
  action: 'subscribe',
  resourceId: 'chart-sales-2024'
}));
```

## 📚 Learning Resources

### Tutorials
1. **[Building Your First EAMP Server](./tutorials/first-server.md)** - Step-by-step guide
2. **[Integrating EAMP in React Apps](./tutorials/react-integration.md)** - Frontend integration
3. **[EAMP for Screen Readers](./tutorials/screen-reader-integration.md)** - Assistive technology
4. **[AI Agent Implementation](./tutorials/ai-agent-guide.md)** - Building AI consumers

### Best Practices
- **[Server Implementation Guidelines](./docs/server-best-practices.md)**
- **[Client Integration Patterns](./docs/client-patterns.md)**  
- **[Performance Optimization](./docs/performance-guide.md)**
- **[Security Considerations](./docs/security-guide.md)**

## 🤝 Contributing Examples

We welcome new examples! Please see our [Contributing Guide](../CONTRIBUTING.md) and:

1. **Follow the established patterns** in existing examples
2. **Include comprehensive documentation** and README files
3. **Add appropriate tests** for your implementation
4. **Validate against the EAMP schema** before submitting
5. **Consider real-world use cases** that others can learn from

## 📄 License

All examples are licensed under MIT - see [LICENSE](../LICENSE) for details.

---

*Built with ❤️ by the EAMP community to demonstrate accessible, AI-ready implementations.*