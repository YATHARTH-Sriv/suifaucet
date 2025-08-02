#!/bin/bash

echo "🚰 Sui Faucet Setup Script"
echo "=========================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your configuration."
else
    echo "⚠️  .env file already exists."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo ""
echo "🔑 Next Steps:"
echo "1. Set up a PostgreSQL database and update DATABASE_URL in .env"
echo "2. Generate a Sui keypair for the faucet:"
echo "   - Install Sui CLI: https://docs.sui.io/guides/developer/getting-started/sui-install"
echo "   - Run: sui client new-address ed25519"
echo "   - Export private key: sui keytool export <address> key-pair"
echo "   - Add the base64 private key to FAUCET_PRIVATE_KEY in .env"
echo "3. Fund the faucet wallet with testnet SUI"
echo "4. Run database migrations: npm run db:migrate"
echo "5. Start the development server: npm run dev"
echo ""
echo "📚 Optional:"
echo "- Set up Redis for distributed rate limiting (REDIS_URL in .env)"
echo "- Deploy to Vercel, Railway, or your preferred platform"
