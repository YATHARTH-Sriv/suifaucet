#!/bin/bash

echo "🔍 Sui Faucet Validation Script"
echo "==============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_env_file() {
    if [ -f .env ]; then
        echo -e "${GREEN}✅ .env file exists${NC}"
        
        if grep -q "DATABASE_URL=" .env && [ -n "$(grep DATABASE_URL= .env | cut -d'=' -f2)" ]; then
            echo -e "${GREEN}✅ DATABASE_URL is set${NC}"
        else
            echo -e "${RED}❌ DATABASE_URL is missing or empty${NC}"
        fi
        
        if grep -q "FAUCET_PRIVATE_KEY=" .env && [ -n "$(grep FAUCET_PRIVATE_KEY= .env | cut -d'=' -f2)" ]; then
            echo -e "${GREEN}✅ FAUCET_PRIVATE_KEY is set${NC}"
        else
            echo -e "${RED}❌ FAUCET_PRIVATE_KEY is missing or empty${NC}"
        fi
    else
        echo -e "${RED}❌ .env file not found${NC}"
        echo -e "${YELLOW}💡 Run: cp .env.example .env${NC}"
    fi
}

check_dependencies() {
    if [ -d node_modules ]; then
        echo -e "${GREEN}✅ Dependencies installed${NC}"
    else
        echo -e "${RED}❌ Dependencies not installed${NC}"
        echo -e "${YELLOW}💡 Run: npm install${NC}"
    fi
}

check_prisma() {
    if [ -d node_modules/@prisma/client ]; then
        echo -e "${GREEN}✅ Prisma client generated${NC}"
    else
        echo -e "${RED}❌ Prisma client not generated${NC}"
        echo -e "${YELLOW}💡 Run: npm run db:generate${NC}"
    fi
}

check_database() {
    echo -e "${YELLOW}🔄 Testing database connection...${NC}"
    if npm run db:generate > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database connection successful${NC}"
    else
        echo -e "${RED}❌ Database connection failed${NC}"
        echo -e "${YELLOW}💡 Check your DATABASE_URL and ensure database is running${NC}"
    fi
}

check_build() {
    echo -e "${YELLOW}🔄 Testing build...${NC}"
    if npm run build > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Build successful${NC}"
    else
        echo -e "${RED}❌ Build failed${NC}"
        echo -e "${YELLOW}💡 Check for TypeScript errors: npm run build${NC}"
    fi
}

echo ""
echo "📋 Environment Check:"
check_env_file

echo ""
echo "📦 Dependencies Check:"
check_dependencies

echo ""
echo "🗄️ Database Check:"
check_prisma
check_database

echo ""
echo "🏗️ Build Check:"
check_build

echo ""
echo "🚀 Next Steps:"
echo "1. Start development server: npm run dev"
echo "2. Open http://localhost:3000"
echo "3. Test the faucet with a valid Sui address"
echo "4. Check admin dashboard at /admin"
echo ""
echo "📚 Need help? Check SETUP.md for detailed instructions"
