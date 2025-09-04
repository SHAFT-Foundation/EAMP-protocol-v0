# Pull Request

## 📝 Description

Provide a brief summary of the changes and the problem they solve.

Fixes # (issue number)

## 🔄 Type of Change

<!-- Mark the relevant option with an 'x' -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] ⚡ Performance improvement
- [ ] 🔧 Refactoring (no functional changes, no api changes)
- [ ] 🎨 Style changes (formatting, missing semicolons, etc.)
- [ ] 🧪 Test changes (adding missing tests, refactoring tests)
- [ ] 📦 Build changes (changes to build process or dependencies)

## 🧪 Testing

### Test Coverage

- [ ] All new and existing tests pass
- [ ] Code coverage meets minimum requirements (80%+)
- [ ] Added tests for new functionality
- [ ] Added tests for edge cases and error conditions

### Test Types Completed

- [ ] **Unit Tests**: `npm test` / `pytest`
- [ ] **Integration Tests**: Component integration verified
- [ ] **E2E Tests**: End-to-end workflows tested
- [ ] **Manual Testing**: Manually verified changes work as expected
- [ ] **Accessibility Testing**: Screen reader and keyboard navigation tested
- [ ] **Cross-browser Testing**: Verified in multiple browsers (if applicable)

### Test Results

```bash
# Paste test output here
# Example:
# ✅ JavaScript SDK: 45/45 tests passed (92% coverage)
# ✅ Python SDK: 38/38 tests passed (88% coverage)
# ✅ React SDK: 23/23 tests passed (85% coverage)
```

## 📋 Quality Checklist

### Code Quality

- [ ] Code follows the project's coding standards
- [ ] Self-review of the code has been performed
- [ ] Code is well-commented, particularly in hard-to-understand areas
- [ ] Variable and function names are descriptive
- [ ] No debug code (console.log, debugger, etc.) left in
- [ ] Error handling is appropriate and user-friendly

### Documentation

- [ ] **Public APIs**: All new public APIs are documented
- [ ] **README**: Updated if functionality or usage changed
- [ ] **CHANGELOG**: Entry added for significant changes
- [ ] **Examples**: Added or updated examples for new features
- [ ] **Migration Guide**: Created for breaking changes

### Performance & Security

- [ ] **Performance**: No significant performance regressions
- [ ] **Memory Usage**: No memory leaks introduced
- [ ] **Security**: Security implications have been considered
- [ ] **Dependencies**: No unnecessary dependencies added
- [ ] **Bundle Size**: Impact on package size is acceptable

## ♿ Accessibility Impact

<!-- This is crucial for EAMP as it's an accessibility-focused protocol -->

### Accessibility Compliance

- [ ] **WCAG 2.2**: Changes maintain WCAG 2.2 AA compliance
- [ ] **Screen Readers**: Tested with screen reader software
- [ ] **Keyboard Navigation**: All functionality accessible via keyboard
- [ ] **Color Contrast**: Visual elements meet contrast requirements
- [ ] **Focus Management**: Focus states are visible and logical
- [ ] **Semantic HTML**: Proper semantic markup used (if applicable)

### Screen Reader Testing

- [ ] **NVDA** (Windows)
- [ ] **JAWS** (Windows)
- [ ] **VoiceOver** (macOS/iOS)
- [ ] **TalkBack** (Android)
- [ ] **Orca** (Linux)

### Accessibility Features Added/Modified

<!-- Describe any accessibility improvements or considerations -->

## 🌐 Protocol Compliance

### EAMP Protocol

- [ ] **Specification Compliance**: Changes follow EAMP v1.0.0 specification
- [ ] **Schema Validation**: All data validates against EAMP JSON Schema
- [ ] **Backward Compatibility**: Maintains compatibility with existing implementations
- [ ] **Transport Layers**: HTTP and WebSocket transports work correctly
- [ ] **Content Types**: Properly handles all EAMP content types

### Cross-Platform Compatibility

- [ ] **JavaScript/Node.js**: Works in browser and Node.js environments
- [ ] **Python**: Compatible with Python 3.8+ versions
- [ ] **React**: Compatible with React 16.8+ (hooks)
- [ ] **TypeScript**: Type definitions are accurate and complete

## 📊 Performance Impact

<!-- Describe any performance implications -->

### Benchmarks

```bash
# If applicable, include benchmark results
# Example:
# Before: Metadata parsing: 125ms average
# After:  Metadata parsing: 98ms average (21.6% improvement)
```

### Resource Usage

- **Memory**: No significant increase / Decrease of X MB
- **CPU**: No significant impact / Improvement in processing time
- **Network**: Bandwidth usage optimized / Additional Y KB per request
- **Bundle Size**: Package size impact: +/- X KB

## 🔄 Breaking Changes

<!-- List any breaking changes and how to migrate -->

### API Changes

<!-- List changed/removed APIs -->

### Migration Steps

<!-- Provide step-by-step migration guide -->

```typescript
// Before (deprecated)
const client = new EAMPClient({
  apiUrl: 'https://api.example.com'
});

// After (current)
const client = new EAMPClient({
  baseUrl: 'https://api.example.com'
});
```

## 📸 Screenshots/Demo

<!-- Add screenshots to help explain your changes -->
<!-- For UI changes, include before/after screenshots -->
<!-- For new features, include usage examples -->

## 🔗 Related Issues/PRs

<!-- Link to related issues and PRs -->

- Closes #123
- Related to #456
- Depends on #789
- Addresses feedback from #101

## 🎯 Testing Instructions

### For Reviewers

<!-- Provide step-by-step testing instructions -->

1. **Setup**: 
   ```bash
   git checkout feature-branch
   npm install
   ```

2. **Test the feature**:
   ```bash
   # Specific commands to test the changes
   npm test
   npm run dev
   ```

3. **Verify accessibility**:
   - Navigate using only keyboard
   - Test with screen reader
   - Check color contrast

### Manual Testing Scenarios

<!-- List specific scenarios to test manually -->

- [ ] **Scenario 1**: Description of test case
- [ ] **Scenario 2**: Description of test case
- [ ] **Edge Case 1**: Description of edge case
- [ ] **Error Handling**: Test error conditions

## 📝 Additional Notes

<!-- Any additional context or notes for reviewers -->

### Implementation Details

<!-- Explain complex implementation decisions -->

### Future Considerations

<!-- Note any future improvements or considerations -->

### Reviewer Notes

<!-- Specific areas where you want reviewer attention -->

---

## ✅ Final Checklist

<!-- Confirm before submitting -->

- [ ] I have read and followed the [Contributing Guidelines](../CONTRIBUTING.md)
- [ ] I have performed a self-review of my code
- [ ] I have tested my changes thoroughly
- [ ] I have updated documentation as needed
- [ ] I have added appropriate tests
- [ ] All tests pass and coverage requirements are met
- [ ] I have considered accessibility implications
- [ ] I have verified EAMP protocol compliance
- [ ] Breaking changes are properly documented
- [ ] I have linked related issues

---

## 🙏 Thank You

Thank you for contributing to EAMP! Your efforts help make the web more accessible for everyone.

<!-- 
  Remember: 
  - Focus on accessibility in all changes
  - Follow WCAG 2.2 AA guidelines
  - Maintain backward compatibility when possible
  - Include comprehensive tests
  - Document all public API changes
-->