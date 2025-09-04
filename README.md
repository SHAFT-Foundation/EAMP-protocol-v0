# Extended Accessibility Metadata Protocol (EAMP)

<div align="center">
  <img src="assets/eamp-logo.svg" alt="EAMP Logo" width="400" height="200" />
  
  **A protocol for seamless accessibility integration between AI applications and web content**
  
  [Documentation](https://eamp.sh/docs) |
  [Specification](https://spec.eamp.sh/) |
  [Community](https://github.com/shaft-finance/eamp-protocol/discussions) |
  [Shaft Products](https://shaft.finance)
</div>

---

## 🌟 Accessibility as a Network Advantage

*"In the AI agent economy, accessibility isn't a feature—it's a network advantage."*

EAMP v1 is the only framework that ensures your site works seamlessly for **both humans and AI agents**. Our comprehensive solution scans, writes fixes, tests them, and submits PRs—making your site ready for the AI-powered future where agents evaluate and select each other.

## 🎯 What is EAMP?

The Extended Accessibility Metadata Protocol (EAMP) defines a two-layer accessibility metadata model that preserves WCAG 2.2/ADA compliance (Layer 1) while introducing a structured, machine-readable layer (Layer 2) that enables AI agents, assistive technologies, and Web2/Web3 apps to retrieve rich, context-heavy descriptions, data tables, and time-coded annotations on demand.

### 🔗 Two-Layer Architecture

- **Layer 1 (Baseline)**: WCAG/ADA-compliant artifacts (short alternatives, captions, labels, transcripts)
- **Layer 2 (Extended)**: JSON-based structured metadata with rich descriptions, data points, and time-coded annotations

## 🚀 Getting Started

### Choose Your Path

<div align="center">

| 📚 **Understand Concepts** | 🔧 **Use EAMP** | 🛠️ **Build Servers** | 💻 **Build Clients** |
|:---------------------------:|:---------------:|:--------------------:|:--------------------:|
| Learn the core concepts and architecture of EAMP | Connect to existing EAMP servers and start using them | Create EAMP servers to expose your accessibility data | Develop applications that connect to EAMP servers |
| [Learn Architecture →](docs/learn/architecture.md) | [Use Remote Server →](docs/tutorials/use-remote-server.md) | [Server Quickstart →](docs/quickstart/server.md) | [Client Quickstart →](docs/quickstart/client.md) |

</div>

### 📦 SDKs Available

- **[JavaScript SDK](packages/javascript-sdk)** - Official JavaScript/TypeScript implementation
- **[React SDK](packages/react-sdk)** - React-specific hooks and components
- **[Python SDK](packages/python-sdk)** - Python implementation for server-side applications

## 🎯 Benefits for Everyone

| **User Type** | **Benefits** |
|:-------------:|:-------------|
| 👥 **Accessibility Users** | Clearer alt text, richer transcripts, plain-language explanations |
| 🤖 **AI Agents** | Structured JSON metadata allows smarter ranking, trust, and selection |
| 🏢 **Businesses** | Compliance + competitive edge in agent-driven marketplaces |
| 👨‍💻 **Developers** | Automated fixes, easy integration, future-proof codebase |

## 💡 Real-World Scenarios

### 🔍 **Scenario 1: Enhanced User Experience**
A blind user hears concise alt text while their AI assistant fetches Layer 2 metadata to narrate the full dataset with rich context and data points.

### 🎯 **Scenario 2: AI Agent Selection**
An AI agent crawls your site and selects it over competitors because of its rich accessibility metadata, leading to higher visibility and trust.

### 📈 **Scenario 3: Business Advantage**
A business owner gains trust, adoption, and compliance—all while preparing for the AI agent economy where accessible sites rank higher.

## 📊 Technical Highlights

### Supported Content Types

- **📊 Images**: Charts, infographics, complex visuals with data points
- **🎥 Videos**: Time-coded scene descriptions and transcripts  
- **🎵 Audio**: Transcripts with speaker identification
- **🖱️ UI Elements**: Extended context for controls and interactions
- **📄 Documents**: Structured content with accessibility features

### Discovery Mechanisms

```html
<!-- HTML Discovery -->
<img src="chart.png" 
     alt="Quarterly sales chart for 2024"
     data-metadata-link="https://api.example.com/eamp/chart-2024" />

<!-- HTTP Headers -->
Link: <https://api.example.com/eamp/chart-2024>; rel="accessibilityMetadata"; type="application/eamp+json"
```

### JSON Response Example

```json
{
  "id": "sales-2024.png",
  "type": "image", 
  "shortAlt": "Quarterly sales chart for 2024",
  "extendedDescription": "Bar chart showing Q1-Q4 2024 sales progression...",
  "dataPoints": [
    {"label": "Q1", "value": 1200000, "unit": "USD"},
    {"label": "Q2", "value": 1500000, "unit": "USD"}
  ],
  "accessibilityFeatures": ["high-contrast", "screen-reader-optimized"]
}
```

## 🏗️ Project Structure

This repository is organized to mirror industry best practices:

- **[specification](specification/)** - Protocol specification and documentation
- **[packages/javascript-sdk](packages/javascript-sdk/)** - JavaScript/TypeScript implementation  
- **[packages/react-sdk](packages/react-sdk/)** - React hooks and components
- **[packages/python-sdk](packages/python-sdk/)** - Python server implementation
- **[docs](docs/)** - User documentation and guides
- **[examples](examples/)** - Reference implementations and sample code
- **[tools](tools/)** - Development and testing utilities

## 🌐 Web3 Support

EAMP includes first-class support for decentralized applications:

```solidity
// Smart Contract Interface
interface IAccessible {
    function accessibilityMetadataURI() external view returns (string memory);
}

// IPFS Integration
{
  "metadataURI": "ipfs://bafy...",
  "sourceAttribution": "Artist: A. Example (2025)"
}
```

## 🔗 Integration with Shaft Products

Accelerate your EAMP implementation with our enterprise tools:

- **[Shaft Scanner](https://shaft.finance/scanner)** - Automated accessibility scanning and reporting
- **[Shaft Fixer](https://shaft.finance/fixer)** - AI-powered accessibility fixes with PR automation  
- **[Shaft Monitor](https://shaft.finance/monitor)** - Continuous accessibility monitoring and alerts
- **[Shaft API](https://shaft.finance/api)** - RESTful API for accessibility data integration

## 📈 Conformance Profiles

- **Profile A (Baseline)**: Layer 1 implementation with WCAG compliance
- **Profile B (Extended)**: Full Layer 1 + Layer 2 JSON metadata  
- **Profile C (Advanced)**: Complete implementation with localization, caching, and Web3

## 🤝 Contributing

We welcome contributions of all kinds! Whether you want to fix bugs, improve documentation, or propose new features:

- 📖 Read our [Contributing Guide](CONTRIBUTING.md)
- 💬 Join our [Community Discussions](https://github.com/shaft-finance/eamp-protocol/discussions)
- 🐛 Report issues on [GitHub Issues](https://github.com/shaft-finance/eamp-protocol/issues)
- 📧 Contact us at [hello@shaft.finance](mailto:hello@shaft.finance)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏢 About

The Extended Accessibility Metadata Protocol is an open source project by [Shaft Finance](https://shaft.finance) and is open to contributions from the entire community. Our mission is to make the web accessible for everyone while preparing for the AI-agent economy.

---

<div align="center">
  <strong>🌟 Star us on GitHub | 🐦 Follow [@ShaftFinance](https://twitter.com/ShaftFinance) | 🌐 Visit [shaft.finance](https://shaft.finance)</strong>
</div>