# EAMP Assets

This directory contains visual assets and resources for the EAMP protocol.

## 📁 Contents

- **Logo Files** - EAMP logo in various formats and sizes
- **Brand Guidelines** - Visual identity standards  
- **Diagrams** - Architecture and protocol flow diagrams
- **Icons** - Accessibility and UI icons
- **Examples** - Visual examples for documentation

## 🎨 Logo Usage

### Available Formats

```
assets/
├── logo/
│   ├── eamp-logo.svg          # Vector logo (preferred)
│   ├── eamp-logo.png          # PNG logo (1200x600)
│   ├── eamp-logo-light.svg    # Light theme variant
│   ├── eamp-logo-dark.svg     # Dark theme variant
│   └── favicon/               # Favicon variants
│       ├── favicon.ico
│       ├── favicon-16x16.png
│       ├── favicon-32x32.png
│       └── apple-touch-icon.png
```

### Brand Colors

- **Primary Blue**: `#2563eb` (rgb(37, 99, 235))
- **Accessibility Green**: `#16a34a` (rgb(22, 163, 74))  
- **Dark Gray**: `#1f2937` (rgb(31, 41, 55))
- **Light Gray**: `#f9fafb` (rgb(249, 250, 251))
- **White**: `#ffffff`

### Logo Guidelines

- Minimum size: 120px wide
- Clear space: 20px on all sides
- Use SVG format when possible
- Maintain aspect ratio
- Don't modify colors or proportions

## 📊 Diagrams

### Architecture Diagrams

```
assets/diagrams/
├── architecture-overview.svg   # High-level system architecture
├── two-layer-model.svg        # Layer 1 + Layer 2 explanation
├── client-server-flow.svg     # Request/response flow
└── discovery-mechanisms.svg   # Metadata discovery process
```

### Protocol Flow Diagrams

```
assets/diagrams/protocol/
├── http-transport.svg         # HTTP-based metadata exchange
├── websocket-updates.svg      # Real-time update flow
├── web3-integration.svg       # IPFS/Arweave integration
└── multilingual-support.svg   # i18n implementation
```

## 🔍 Icons

### Accessibility Icons

```
assets/icons/accessibility/
├── screen-reader.svg          # Screen reader support
├── high-contrast.svg          # High contrast mode
├── keyboard-nav.svg           # Keyboard navigation
├── voice-control.svg          # Voice control
├── captions.svg              # Captions available
└── audio-description.svg     # Audio descriptions
```

### Content Type Icons

```
assets/icons/content-types/
├── image.svg                 # Image content
├── video.svg                 # Video content  
├── audio.svg                 # Audio content
├── ui-element.svg           # UI elements
└── document.svg             # Document content
```

### Status Icons

```
assets/icons/status/
├── compliant.svg            # WCAG compliant
├── enhanced.svg             # EAMP enhanced
├── processing.svg           # Processing state
├── error.svg               # Error state
└── success.svg             # Success state
```

## 🖼️ Example Visuals

### Before/After Comparisons

```
assets/examples/
├── before-after/
│   ├── chart-basic-alt.png      # Basic alt text only
│   ├── chart-eamp-enhanced.png  # With EAMP metadata
│   ├── video-captions-only.png  # Standard captions
│   └── video-scene-aware.png    # Scene descriptions
```

### Use Case Scenarios

```
assets/examples/scenarios/
├── ecommerce-product.png        # Product image metadata
├── education-chart.png          # Educational data viz
├── news-article.png            # Article with images
└── streaming-video.png         # Video platform
```

## 📱 Responsive Assets

### Breakpoint Variations

```
assets/responsive/
├── mobile/                     # Mobile-optimized assets
├── tablet/                     # Tablet layouts
└── desktop/                    # Desktop presentations
```

## 🎭 Accessibility Considerations

All assets in this directory follow accessibility best practices:

- **High contrast ratios** (WCAG AA compliance minimum)
- **Scalable vector graphics** where possible
- **Alternative text** provided for all images
- **Color-blind friendly** color palettes
- **Print-friendly** versions available

## 📄 Usage Rights

### Open Source Assets

Most assets are available under MIT license for:
- Documentation usage
- Educational materials  
- Non-commercial implementations
- Open source projects

### Shaft Finance Branding

Shaft Finance branded assets require permission:
- Commercial usage
- Derivative works
- Rebranding or modification

Contact [brand@shaft.finance](mailto:brand@shaft.finance) for licensing.

## 🛠️ Asset Creation Guidelines

When contributing new assets:

1. **Follow brand guidelines** established here
2. **Ensure accessibility** compliance
3. **Provide multiple formats** (SVG + PNG minimum)  
4. **Include source files** when possible
5. **Test across devices** and browsers
6. **Document usage** and licensing

### Tools Recommended

- **Vector Graphics**: Figma, Adobe Illustrator, Inkscape
- **Raster Images**: Adobe Photoshop, GIMP
- **Diagrams**: Miro, Lucidchart, Draw.io
- **Icons**: Heroicons, Feather Icons, FontAwesome

## 📋 Asset Request Process

Need a custom asset? Follow these steps:

1. **Check existing assets** in this directory first
2. **Open a GitHub issue** with asset requirements
3. **Provide detailed specifications** and use case
4. **Include examples** or mockups if possible
5. **Specify timeline** and priority level

### Request Template

```markdown
## Asset Request

**Type**: Logo/Icon/Diagram/Image
**Purpose**: [Brief description]
**Specifications**: 
- Dimensions: 
- Formats needed:
- Colors:
- Style requirements:

**Use Case**: [Where will this be used?]
**Timeline**: [When do you need this?]
**Priority**: Low/Medium/High

**Additional Notes**: [Any other requirements]
```

## 🤝 Contributing Assets

We welcome asset contributions! Please:

1. **Fork the repository**
2. **Add assets** to appropriate subdirectories
3. **Update this README** with new asset descriptions
4. **Include source files** when possible
5. **Submit a pull request** with clear description

### Asset Naming Conventions

- Use **kebab-case** for file names
- Include **dimensions** for raster images: `logo-1200x600.png`
- Specify **variants**: `logo-light.svg`, `logo-dark.svg`
- Use **descriptive names**: `accessibility-high-contrast-icon.svg`

---

*Visual assets designed with accessibility and inclusivity in mind, supporting the EAMP mission of making the web accessible for everyone.*