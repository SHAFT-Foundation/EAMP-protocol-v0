#!/bin/bash

# EAMP Protocol Test Runner
# Comprehensive test suite for all EAMP components

set -e

echo "🧪 EAMP Protocol Test Suite Runner"
echo "===================================="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TEST_RESULTS=()
OVERALL_SUCCESS=true

# Function to run tests for a component
run_tests() {
    local component=$1
    local path=$2
    local command=$3
    
    echo -e "${BLUE}Testing $component...${NC}"
    echo "Path: $path"
    echo "Command: $command"
    echo
    
    if cd "$path" && eval "$command"; then
        echo -e "${GREEN}✅ $component tests PASSED${NC}"
        TEST_RESULTS+=("$component: PASSED")
    else
        echo -e "${RED}❌ $component tests FAILED${NC}"
        TEST_RESULTS+=("$component: FAILED")
        OVERALL_SUCCESS=false
    fi
    
    echo
    echo "----------------------------------------"
    echo
    
    # Return to root
    cd "$(dirname "$0")"
}

# Function to check if dependencies are installed
check_dependencies() {
    local component=$1
    local path=$2
    local check_command=$3
    
    echo -e "${YELLOW}Checking $component dependencies...${NC}"
    
    if cd "$path" && eval "$check_command"; then
        echo -e "${GREEN}✅ $component dependencies OK${NC}"
    else
        echo -e "${YELLOW}⚠️  Installing $component dependencies...${NC}"
        if [[ $path == *"python"* ]]; then
            pip install -e ".[test]" || pip install -e ".[dev]" || true
        else
            npm install || yarn install || true
        fi
    fi
    
    echo
    cd "$(dirname "$0")"
}

echo "🔍 Checking project structure..."
if [[ ! -f "package.json" || ! -f "pyproject.toml" ]]; then
    echo -e "${RED}❌ Not in EAMP protocol root directory${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Project structure OK${NC}"
echo

# Test JavaScript SDK
if [[ -d "packages/javascript-sdk" ]]; then
    check_dependencies "JavaScript SDK" "packages/javascript-sdk" "test -f node_modules/.bin/jest"
    run_tests "JavaScript SDK" "packages/javascript-sdk" "npm test -- --coverage --ci"
else
    echo -e "${YELLOW}⚠️  JavaScript SDK not found, skipping...${NC}"
fi

# Test Python SDK
if [[ -d "packages/python-sdk" ]]; then
    check_dependencies "Python SDK" "packages/python-sdk" "python -c 'import pytest'"
    run_tests "Python SDK" "packages/python-sdk" "python -m pytest tests/ -v --cov=eamp --cov-report=term --cov-report=html"
else
    echo -e "${YELLOW}⚠️  Python SDK not found, skipping...${NC}"
fi

# Test React SDK
if [[ -d "packages/react-sdk" ]]; then
    check_dependencies "React SDK" "packages/react-sdk" "test -f node_modules/.bin/jest"
    run_tests "React SDK" "packages/react-sdk" "npm test -- --coverage --ci --watchAll=false"
else
    echo -e "${YELLOW}⚠️  React SDK not found, skipping...${NC}"
fi

# Test Node.js Express Server
if [[ -d "examples/servers/nodejs-express" ]]; then
    check_dependencies "Node.js Express Server" "examples/servers/nodejs-express" "test -f node_modules/.bin/jest"
    run_tests "Node.js Express Server" "examples/servers/nodejs-express" "npm test -- --coverage --ci"
else
    echo -e "${YELLOW}⚠️  Node.js Express Server not found, skipping...${NC}"
fi

# Test Python FastAPI Server
if [[ -d "examples/servers/python-fastapi" ]]; then
    check_dependencies "Python FastAPI Server" "examples/servers/python-fastapi" "python -c 'import pytest'"
    run_tests "Python FastAPI Server" "examples/servers/python-fastapi" "python -m pytest tests/ -v --cov=app --cov-report=term --cov-report=html"
else
    echo -e "${YELLOW}⚠️  Python FastAPI Server not found, skipping...${NC}"
fi

# Test Summary
echo
echo "📊 TEST SUMMARY"
echo "==============="
echo

for result in "${TEST_RESULTS[@]}"; do
    if [[ $result == *"PASSED"* ]]; then
        echo -e "${GREEN}$result${NC}"
    else
        echo -e "${RED}$result${NC}"
    fi
done

echo
if $OVERALL_SUCCESS; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! 🎉${NC}"
    echo
    echo "Coverage reports generated in:"
    echo "  - packages/javascript-sdk/coverage/"
    echo "  - packages/python-sdk/htmlcov/"
    echo "  - packages/react-sdk/coverage/"
    echo "  - examples/servers/nodejs-express/coverage/"
    echo "  - examples/servers/python-fastapi/htmlcov/"
    echo
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo
    echo "Please check the output above for details."
    exit 1
fi