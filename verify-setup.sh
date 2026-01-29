#!/bin/bash

# BASE NYC Setup Verification Script

echo "========================================="
echo "  BASE NYC - Setup Verification"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js 16+"
    exit 1
fi

# Check npm
echo "Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm installed: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found."
    exit 1
fi

echo ""
echo "========================================="
echo "  Environment Variables Check"
echo "========================================="
echo ""

# Check .env file exists
if [ -f .env ]; then
    echo -e "${GREEN}✓${NC} .env file found"

    # Check Webflow API token
    if grep -q "REACT_APP_WEBFLOW_API_TOKEN=ws-" .env; then
        echo -e "${GREEN}✓${NC} Webflow API token configured"
    else
        echo -e "${RED}✗${NC} Webflow API token missing or invalid"
    fi

    # Check Assembly API key
    if grep -q "REACT_APP_ASSEMBLY_API_KEY=" .env && [ -n "$(grep REACT_APP_ASSEMBLY_API_KEY= .env | cut -d'=' -f2)" ]; then
        echo -e "${GREEN}✓${NC} Assembly API key configured"
    else
        echo -e "${YELLOW}!${NC} Assembly API key not configured"
    fi

    # Check Webflow Site ID
    if grep -q "REACT_APP_WEBFLOW_SITE_ID=" .env && [ -n "$(grep REACT_APP_WEBFLOW_SITE_ID= .env | cut -d'=' -f2 | grep -v 'your_site_id_here')" ]; then
        echo -e "${GREEN}✓${NC} Webflow Site ID configured"
    else
        echo -e "${YELLOW}!${NC} Webflow Site ID not configured (required for live CMS)"
    fi

    # Check sample data setting
    if grep -q "REACT_APP_USE_SAMPLE_DATA=false" .env; then
        echo -e "${YELLOW}!${NC} Using LIVE CMS data (requires Webflow collections)"
    else
        echo -e "${GREEN}✓${NC} Using SAMPLE data (good for development)"
    fi

else
    echo -e "${RED}✗${NC} .env file not found!"
    exit 1
fi

echo ""
echo "========================================="
echo "  File Structure Check"
echo "========================================="
echo ""

# Check required files
FILES=(
    "src/App.tsx"
    "src/app_(8).jsx"
    "src/main.tsx"
    "src/index.css"
    "index.html"
    "package.json"
    "README.md"
    "QUICK_START.md"
    "WEBFLOW_SETUP_GUIDE.md"
    "ASSEMBLY_INTEGRATION_GUIDE.md"
    "IMPLEMENTATION_SUMMARY.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file missing"
    fi
done

echo ""
echo "========================================="
echo "  Dependencies Check"
echo "========================================="
echo ""

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules directory exists"
else
    echo -e "${YELLOW}!${NC} node_modules not found. Run: npm install"
fi

echo ""
echo "========================================="
echo "  Build Check"
echo "========================================="
echo ""

echo "Attempting to build project..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Build successful!"
else
    echo -e "${RED}✗${NC} Build failed. Check console for errors."
    echo "    Run: npm run build"
fi

echo ""
echo "========================================="
echo "  Next Steps"
echo "========================================="
echo ""

# Count missing collection IDs
MISSING_COLLECTIONS=0
COLLECTIONS=(
    "HERO_CONTENT"
    "PRODUCTION_SERVICES"
    "STUDIO_AMENITIES"
    "CONNECT_FEATURES"
    "BLOG_POSTS"
    "PORTFOLIO"
    "DRONE_PORTFOLIO"
    "LEADERS"
    "TOUR_SLIDES"
    "CLIENT_LOGOS"
)

for collection in "${COLLECTIONS[@]}"; do
    VAR_NAME="REACT_APP_COLLECTION_$collection"
    if ! grep -q "$VAR_NAME=.\+" .env 2>/dev/null; then
        ((MISSING_COLLECTIONS++))
    fi
done

if [ $MISSING_COLLECTIONS -gt 0 ]; then
    echo -e "${YELLOW}⚠${NC}  You have $MISSING_COLLECTIONS Webflow collections not configured"
    echo ""
    echo "To use live CMS data:"
    echo "1. Read WEBFLOW_SETUP_GUIDE.md"
    echo "2. Create collections in Webflow"
    echo "3. Add Collection IDs to .env"
    echo "4. Set REACT_APP_USE_SAMPLE_DATA=false"
    echo ""
else
    echo -e "${GREEN}✓${NC} All Webflow collections configured!"
    echo ""
fi

echo "Quick commands:"
echo "  npm run dev      - Start development server"
echo "  npm run build    - Build for production"
echo "  npm run preview  - Preview production build"
echo ""

echo -e "${GREEN}Setup verification complete!${NC}"
echo ""
echo "For detailed guides, see:"
echo "  - README.md (overview)"
echo "  - QUICK_START.md (quick reference)"
echo "  - WEBFLOW_SETUP_GUIDE.md (CMS setup)"
echo "  - ASSEMBLY_INTEGRATION_GUIDE.md (form analytics)"
echo ""
