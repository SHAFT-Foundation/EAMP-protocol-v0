# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the EAMP (Extended Accessibility Metadata Protocol) v0 repository - a standards documentation project that defines a two-layer accessibility metadata model for Web2, Web3, and native applications. The protocol preserves WCAG 2.2/ADA compliance while enabling AI agents and assistive technologies to access rich, structured metadata.

## Repository Structure

This is primarily a documentation repository with the following key components:

- `/documents/` - Contains the core protocol specifications:
  - `EAMP-v1-Full-Protocol.pdf` - Complete protocol specification with normative requirements
  - `EAMP-v1-Marketing-Summary.pdf` - Executive summary and marketing materials
- `README.md` - Basic project introduction
- `LICENSE` - MIT License from Shaft Foundation

## Protocol Architecture

EAMP defines a two-layer system:

**Layer 1 (Baseline)**: WCAG/ADA-compliant artifacts (short alternatives, captions, labels, transcripts)
**Layer 2 (Extended)**: JSON-based structured metadata with rich descriptions, data points, and time-coded annotations

### Key Technical Components

1. **JSON Schema**: Canonical schema for EAMP metadata with required fields:
   - `id`, `type`, `shortAlt`, `extendedDescription`
   - Optional: `tags`, `dataPoints`, `transcript`, `scenes`, `accessibilityFeatures`

2. **Discovery Mechanisms**:
   - HTML: `data-metadata-link`, `rel="accessibilityMetadata"`, `aria-details`
   - HTTP: Link headers with `rel="accessibilityMetadata"`
   - Content negotiation: `Accept: application/eamp+json`

3. **Transport**: HTTP(S) and decentralized URIs (IPFS, Arweave)

4. **Web3 Extensions**: Smart contract interfaces (`IAccessible`) and off-chain metadata

## Content Types Supported

- **Images**: Charts, infographics, complex visuals with data points
- **Videos**: Time-coded scene descriptions and transcripts
- **Audio**: Transcripts with speaker identification
- **UI Elements**: Extended context for controls and interactions
- **Documents**: Structured content with accessibility features

## Conformance Profiles

- **Profile A (Baseline)**: Layer 1 implementation only
- **Profile B (Extended)**: Layer 1 + Layer 2 JSON metadata
- **Profile C (Advanced)**: Full implementation with localization, caching, and Web3

## Development Guidelines

### When Working on EAMP Implementation Code

1. **Always validate against the JSON schema** in section 4.1 of the protocol
2. **Ensure Layer 1 compliance first** - never break existing accessibility
3. **Follow RFC 2119 keywords** (MUST, SHOULD, MAY) as defined in the spec
4. **Test with assistive technologies** - screen readers, voice control, etc.

### Character Limits

- Layer 1 `shortAlt`: 100-250 chars (up to 500 for cognitive accessibility)
- Layer 2 `shortAlt`: Maximum 250 characters
- Layer 2 `extendedDescription`: No arbitrary truncation (use pagination if needed)

### Required HTTP Headers

```
Content-Type: application/eamp+json
ETag: "W/"a11y-6f2""
Cache-Control: public, max-age=86400
Link: <metadata-uri>; rel="accessibilityMetadata"
```

### Error Handling

Use the standard error envelope format:
```json
{
  "error": {
    "code": "ValidationError", 
    "message": "shortAlt exceeds 250 characters",
    "field": "shortAlt"
  }
}
```

## Common Implementation Patterns

### HTML Discovery Pattern
```html
<img src="chart.png"
     alt="Quarterly sales chart for 2024"
     aria-details="desc-chart"
     data-metadata-link="https://api.example.com/metadata/chart" />
```

### Web3 Smart Contract Pattern
```solidity
interface IAccessible {
    function accessibilityMetadataURI() external view returns (string memory);
}
```

### OpenAPI Integration
Reference the schema at: `https://shaft.finance/schemas/eamp.metadata.schema.json`

## Persona-Oriented Design

Consider different user needs when implementing:
- **Screen reader users**: 100-250 char summaries for rapid navigation
- **Cognitive/learning disabilities**: 250-500 chars with plain language
- **Low vision**: Pair with high-contrast cues
- **Motor impairments**: Emphasize control states and shortcuts

## Localization Support

Support BCP 47 language tags via:
- Content-Language headers
- Per-field naming conventions (`shortAlt_en`, `shortAlt_es`)
- Multi-script content indication

## Security Considerations

- Private metadata requires authorization
- Redact PII by default  
- Use content addressing (IPFS CID) for integrity
- Support optional signatures for decentralized content

## Standards Compliance

This protocol maps to WCAG 2.2 Success Criteria:
- 1.1.1 Non-text Content → Layer 1 + Layer 2 extended descriptions
- 1.2.x Time-based Media → Captions + detailed transcripts
- 2.4.x Navigable → Clear labels with Layer 2 context
- 3.1.x Readable → Plain language Layer 1, detailed Layer 2
- 4.1.x Compatible → Programmatically determinable structure

## Version Management

- Use semantic versioning for breaking changes
- Include `"eampVersion": "1.0.0"` in JSON payloads
- Maintain backward compatibility within major versions