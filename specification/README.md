# EAMP Protocol Specification v1.0

This directory contains the formal specification for the Extended Accessibility Metadata Protocol (EAMP) v1.0.

## 📋 Contents

- **[Core Specification](./specification.md)** - Complete protocol specification with normative requirements
- **[JSON Schemas](./schemas/)** - Formal JSON Schema definitions for all data structures
- **[OpenAPI](./openapi/)** - OpenAPI 3.1 specification for HTTP transport
- **[Examples](./examples/)** - Reference examples and test cases

## 🎯 Overview

EAMP v1.0 defines a two-layer accessibility metadata model:

- **Layer 1 (Baseline)**: WCAG 2.2/ADA compliant artifacts (short alternatives, captions, labels, transcripts)
- **Layer 2 (Extended)**: JSON-based structured metadata for rich accessibility context

## 🔗 Key Features

- **Progressive Enhancement**: Never reduces existing accessibility
- **Multi-modal Support**: Visual, auditory, cognitive, and motor accessibility
- **AI-Agent Ready**: Structured metadata for automated ranking and selection
- **Web3 Compatible**: Decentralized URI support (IPFS, Arweave)
- **Internationalization**: Multi-language support with BCP 47 tags

## 📊 Conformance Profiles

### Profile A (Baseline)
- ✅ Layer 1 WCAG compliance
- ✅ Basic discovery mechanisms
- ✅ Minimum viable accessibility

### Profile B (Extended)  
- ✅ Profile A requirements
- ✅ Layer 2 JSON metadata
- ✅ Enhanced content descriptions
- ✅ Data point representation

### Profile C (Advanced)
- ✅ Profile B requirements
- ✅ Real-time updates
- ✅ Multi-language support
- ✅ Web3 integration
- ✅ Performance optimization

## 🔍 Quick Reference

### Content Types Supported

| Type | Layer 1 | Layer 2 Extensions |
|------|---------|-------------------|
| **Images** | alt text, aria-details | dataPoints, visualElements |
| **Videos** | captions, transcripts | scenes, timeCodedDescriptions |
| **Audio** | transcripts | speakerIds, audioDescriptions |
| **UI Elements** | labels, roles, states | context, shortcuts, workflows |
| **Documents** | headings, structure | sections, metadata, annotations |

### Discovery Methods

```html
<!-- HTML Link Element -->
<link rel="accessibilityMetadata" 
      href="/eamp/resource-123" 
      type="application/eamp+json" />

<!-- Data Attribute -->
<img data-eamp-metadata="/eamp/image-456" 
     alt="Chart showing sales data" />

<!-- ARIA Details -->
<div aria-details="eamp-description-789">Content</div>
```

### HTTP Headers

```http
Link: </eamp/resource-123>; rel="accessibilityMetadata"; type="application/eamp+json"
Accept: application/eamp+json
Content-Type: application/eamp+json; charset=utf-8
```

### Canonical JSON Structure

```json
{
  "id": "resource-identifier",
  "type": "image|video|audio|ui-element|document",
  "eampVersion": "1.0.0",
  "shortAlt": "Brief description (≤250 chars)",
  "extendedDescription": "Detailed accessibility description",
  "dataPoints": [
    {"label": "Q1 Sales", "value": 1200000, "unit": "USD"}
  ],
  "accessibilityFeatures": ["high-contrast", "screen-reader-optimized"],
  "tags": ["finance", "quarterly", "2024"],
  "metadataURI": "https://api.example.com/eamp/resource-123"
}
```

## 🌐 Transport Support

### HTTP/HTTPS
- RESTful endpoints
- Content negotiation
- Caching with ETags
- Error handling

### WebSocket
- Real-time updates
- Subscription model
- Event notifications

### Decentralized
- IPFS content addressing
- Arweave permanent storage
- ENS domain resolution

## 🔒 Security Considerations

- **Authentication**: OAuth 2.0, API keys, custom headers
- **Privacy**: PII redaction by default
- **Integrity**: Content addressing and cryptographic signatures
- **Performance**: CDN-friendly caching strategies

## 📏 Character Limits & Guidelines

| Field | Layer 1 Limit | Layer 2 Limit | Notes |
|-------|--------------|---------------|-------|
| shortAlt | 100-250 chars | ≤250 chars | Screen reader optimized |
| extendedDescription | N/A | No limit | Use pagination for very large content |
| transcript | No limit | No limit | Full transcript recommended |

## 🌍 Internationalization

```json
{
  "shortAlt_en": "English description",
  "shortAlt_es": "Descripción en español", 
  "shortAlt_fr": "Description en français",
  "extendedDescription_en": "Detailed English description...",
  "extendedDescription_es": "Descripción detallada en español..."
}
```

## ⚡ Performance Optimization

### Caching Strategy
- Strong validators (ETags)
- Appropriate Cache-Control headers
- CDN-friendly design
- Range request support

### Pagination
```json
{
  "metadata": {...},
  "pagination": {
    "offset": 0,
    "limit": 100,
    "total": 250,
    "next": "/eamp/resource-123?offset=100"
  }
}
```

## 🧪 Testing & Validation

### Schema Validation
All responses MUST validate against the canonical JSON Schema:
```
https://schemas.eamp.sh/v1.0/metadata.schema.json
```

### Test Endpoints
```http
GET /eamp/test/validation     # Schema validation test
GET /eamp/test/performance    # Performance test suite
GET /eamp/test/compatibility  # Cross-platform compatibility
```

## 📈 Version History

- **v1.0.0** (2024-09) - Initial release
  - Two-layer architecture
  - Core content type support
  - HTTP/WebSocket transport
  - Web3 extensions

## 🔗 Related Documents

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/)
- [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification)
- [RFC 2119 - Key Words](https://tools.ietf.org/html/rfc2119)
- [BCP 47 - Language Tags](https://tools.ietf.org/html/bcp47)

## 💬 Questions & Feedback

- **Discussions**: [GitHub Discussions](https://github.com/shaft-finance/eamp-protocol/discussions)
- **Issues**: [GitHub Issues](https://github.com/shaft-finance/eamp-protocol/issues)
- **Email**: [spec@eamp.sh](mailto:spec@eamp.sh)

---

*The EAMP specification is maintained by [Shaft Finance](https://shaft.finance) with input from the accessibility community.*