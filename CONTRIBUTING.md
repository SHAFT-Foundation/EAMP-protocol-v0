# Contributing to EAMP

Thank you for your interest in contributing to the Extended Accessibility Metadata Protocol (EAMP)! This document provides guidelines for contributing to the EAMP ecosystem.

## 🎯 Ways to Contribute

### 💡 Ideas and Discussion
- Join our [GitHub Discussions](https://github.com/shaft-finance/eamp-protocol/discussions)
- Share use cases and implementation ideas
- Propose protocol enhancements
- Discuss accessibility best practices

### 🐛 Bug Reports
- Report issues with the specification
- Flag problems with reference implementations  
- Identify accessibility concerns
- Document edge cases or ambiguities

### 📝 Documentation
- Improve README files and guides
- Add examples and tutorials
- Translate documentation
- Enhance API documentation

### 💻 Code Contributions
- SDK improvements and bug fixes
- New reference implementations
- Development tools and utilities
- Test coverage improvements

### 🌐 Protocol Development
- Specification refinements
- Schema enhancements  
- New content type support
- Transport layer improvements

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** for JavaScript/React SDK development
- **Python 3.8+** for Python SDK development
- **Git** for version control
- **Docker** for containerized testing (optional)

### Setting Up Development Environment

```bash
# Clone the repository
git clone https://github.com/shaft-finance/eamp-protocol.git
cd eamp-protocol

# Install dependencies for JavaScript SDK
cd packages/javascript-sdk
npm install
npm run build

# Install dependencies for Python SDK  
cd ../python-sdk
pip install -e .
pip install -r requirements-dev.txt

# Run tests to verify setup
npm test  # JavaScript
pytest    # Python
```

### Development Workflow

1. **Fork the repository** on GitHub
2. **Create a feature branch** from `main`
3. **Make your changes** following our coding standards
4. **Write or update tests** for your changes
5. **Run the test suite** to ensure everything passes
6. **Submit a pull request** with a clear description

## 📋 Contribution Guidelines

### Code Style

#### JavaScript/TypeScript
- Use **Prettier** for formatting (config in `.prettierrc`)
- Follow **ESLint** rules (config in `.eslintrc.js`)
- Use **TypeScript strict mode**
- Prefer `async/await` over Promises
- Use descriptive variable names

```typescript
// ✅ Good
async function getAccessibilityMetadata(resourceId: string): Promise<EAMPMetadata> {
  const response = await fetch(`/eamp/${resourceId}`);
  return response.json();
}

// ❌ Avoid
function getMeta(id) {
  return fetch(`/eamp/${id}`).then(r => r.json());
}
```

#### Python
- Follow **PEP 8** style guide
- Use **Black** for code formatting
- Use **type hints** for all functions
- Follow **docstring** conventions
- Use **async/await** for I/O operations

```python
# ✅ Good
async def get_accessibility_metadata(resource_id: str) -> Optional[EAMPMetadata]:
    """
    Retrieve accessibility metadata for a specific resource.
    
    Args:
        resource_id: Unique identifier for the resource
        
    Returns:
        Metadata object or None if not found
    """
    response = await client.get(f"/eamp/{resource_id}")
    return EAMPMetadata.parse_obj(response.json())

# ❌ Avoid  
def get_meta(id):
    response = requests.get(f"/eamp/{id}")
    return response.json()
```

### Documentation Standards

#### README Files
- Include **clear installation instructions**
- Provide **quick start examples**
- Document **all public APIs**
- Add **troubleshooting section**
- Keep examples **up-to-date**

#### Code Comments
- Document **complex logic** and algorithms
- Explain **accessibility considerations**
- Reference **WCAG guidelines** where relevant
- Include **links to specifications**

```typescript
/**
 * Validates EAMP metadata against the JSON schema.
 * 
 * This ensures compliance with WCAG 2.2 guidelines for Layer 1
 * accessibility while validating Layer 2 structured metadata.
 * 
 * @see https://spec.eamp.sh/v1.0/metadata-schema
 * @see https://www.w3.org/WAI/WCAG22/
 */
export function validateMetadata(metadata: EAMPMetadata): ValidationResult {
  // Validation logic...
}
```

### Testing Requirements

#### Unit Tests
- **Test coverage minimum: 90%**
- Test both **happy path** and **error cases**
- Mock external dependencies
- Use **descriptive test names**

```typescript
describe('EAMPClient', () => {
  describe('getMetadata', () => {
    it('should return metadata for valid resource ID', async () => {
      const metadata = await client.getMetadata('test-resource');
      expect(metadata).toBeDefined();
      expect(metadata.id).toBe('test-resource');
    });

    it('should throw ResourceNotFoundError for invalid resource ID', async () => {
      await expect(client.getMetadata('invalid-id'))
        .rejects.toThrow(ResourceNotFoundError);
    });
  });
});
```

#### Integration Tests
- Test **end-to-end workflows**
- Verify **cross-platform compatibility**
- Test **accessibility tool integration**
- Validate **performance characteristics**

#### Accessibility Testing
- Test with **screen readers** (NVDA, JAWS, VoiceOver)
- Verify **keyboard navigation**
- Check **color contrast** and visual accessibility
- Validate **WCAG 2.2 compliance**

### Commit Message Guidelines

Use **conventional commit** format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(client): add real-time metadata updates via WebSocket

- Implement WebSocket connection for live updates
- Add subscription management for resource changes
- Include automatic reconnection logic
- Update TypeScript types for new events

Closes #123
```

```
fix(schema): correct validation for multilingual fields

The regex pattern for language tags was too restrictive,
preventing valid BCP 47 tags like 'en-US' from passing.

Fixes #456
```

## 🔍 Review Process

### Pull Request Checklist

Before submitting a PR, ensure:

- [ ] **Tests pass** on all platforms
- [ ] **Code follows style guidelines**  
- [ ] **Documentation is updated**
- [ ] **Accessibility has been tested**
- [ ] **Breaking changes are documented**
- [ ] **Examples are provided** for new features
- [ ] **Schema validation passes**

### Review Criteria

PRs will be evaluated based on:

1. **Accessibility Impact**: Does this improve accessibility?
2. **Specification Compliance**: Follows EAMP protocol correctly?
3. **Code Quality**: Well-structured, tested, documented?
4. **Backwards Compatibility**: Maintains existing integrations?
5. **Performance**: Doesn't introduce significant slowdowns?
6. **Security**: No security vulnerabilities introduced?

### Review Timeline

- **Simple fixes**: 1-2 days
- **Feature additions**: 3-7 days  
- **Specification changes**: 1-2 weeks
- **Breaking changes**: Requires community discussion

## 🏷️ Release Process

### Versioning

EAMP follows [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes to protocol or APIs
- **MINOR**: New features, backwards compatible
- **PATCH**: Bug fixes, backwards compatible

### Release Types

#### Protocol Releases
- Specification updates
- Schema changes
- New content type support
- Require community review

#### SDK Releases  
- Bug fixes and improvements
- New platform support
- Performance optimizations
- Regular maintenance releases

## 🌟 Recognition

Contributors will be recognized:

- **README acknowledgments** for significant contributions
- **Release notes** credit for features and fixes
- **Community showcase** for innovative implementations
- **Conference presentations** for major protocol advances

## 📞 Getting Help

### Community Support

- **[GitHub Discussions](https://github.com/shaft-finance/eamp-protocol/discussions)** - General questions
- **[Discord Server](https://discord.gg/eamp)** - Real-time chat
- **[Stack Overflow](https://stackoverflow.com/questions/tagged/eamp)** - Technical questions

### Direct Contact

- **Technical questions**: [dev@eamp.sh](mailto:dev@eamp.sh)
- **Accessibility concerns**: [accessibility@eamp.sh](mailto:accessibility@eamp.sh)
- **Security issues**: [security@eamp.sh](mailto:security@eamp.sh)
- **General inquiries**: [hello@shaft.finance](mailto:hello@shaft.finance)

## 📄 Code of Conduct

### Our Pledge

We pledge to make participation in EAMP a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what's best for the community
- Showing empathy towards others

**Unacceptable behavior includes:**
- Harassment or discriminatory language
- Trolling, insulting, or derogatory comments
- Public or private harassment
- Publishing others' private information
- Any conduct inappropriate in a professional setting

### Enforcement

Instances of abusive behavior may be reported to [conduct@eamp.sh](mailto:conduct@eamp.sh). All complaints will be reviewed and investigated promptly and fairly.

## 🎉 Thank You!

Your contributions help make the web more accessible for everyone. Whether you're fixing a typo, adding a feature, or improving documentation, every contribution matters.

Together, we're building a more inclusive digital future where accessibility is a network advantage, not an afterthought.

---

*This contributing guide is inspired by the accessibility community's commitment to inclusive design and collaborative development.*