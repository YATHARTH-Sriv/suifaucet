# Sui Testnet Faucet DApp

A fast, reliable, and user-friendly Sui testnet faucet that provides SUI tokens for development and testing.

## Features

✅ **Core Features**
- Clean web UI with wallet address validation
- Sui testnet token distribution (10 SUI per request)
- Smart rate limiting (per IP & wallet address)
- Request logging and tracking
- Mobile responsive design
- Sub-30 second token delivery

✅ **Admin Dashboard**
- Real-time analytics and monitoring
- Request logs and filtering
- Success rate tracking
- Faucet balance monitoring

✅ **Security & Fraud Protection**
- IP-based rate limiting (10 requests/day per IP)
- Wallet-based rate limiting (1 request/day per wallet)
- Geolocation-based fraud detection
- VPN/Proxy detection
- Request logging for audit trails

✅ **Wallet Integration**
- Manual address input with validation
- Wallet Connect support (via @mysten/dapp-kit)
- Transaction confirmation and explorer links

✅ **Discord Bot** (Optional)
- `/faucet` slash command for token requests
- `/faucet-status` command for status checking
- Rich embeds and button interactions
- Role-based access control ready

## Quick Start

### 1. Environment Setup

Copy `.env.example` to `.env.local` and configure:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/suifaucet"
DIRECT_URL="postgresql://username:password@localhost:5432/suifaucet"

# Sui Configuration
SUI_PRIVATE_KEY="your_base64_private_key"
SUI_NETWORK="testnet"

# Redis (for rate limiting)
REDIS_URL="redis://localhost:6379"

# Admin Authentication
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your_secure_password"
JWT_SECRET="your_jwt_secret"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

# Discord Bot (Optional)
DISCORD_BOT_TOKEN="your_bot_token"
DISCORD_CLIENT_ID="your_client_id"
DISCORD_GUILD_ID="your_server_id"
```

### 2. Installation

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Start Redis (if using Docker)
docker run -d -p 6379:6379 redis:alpine

# Run development server
npm run dev
```

## Configuration Guide

### Sui Setup
1. Create a new Sui wallet for the faucet
2. Fund it with testnet SUI tokens
3. Export private key as base64 and set `SUI_PRIVATE_KEY`

### Database Setup
- **Development**: Use local PostgreSQL or Prisma's cloud database
- **Production**: Use managed PostgreSQL (AWS RDS, DigitalOcean, etc.)

### Redis Setup
- **Development**: Local Redis instance
- **Production**: Managed Redis (AWS ElastiCache, Redis Cloud, etc.)

## API Endpoints

### Public Endpoints
- `POST /api/faucet` - Request tokens
- `GET /api/faucet` - Check rate limits and faucet status
- `GET /api/health` - Health check

### Admin Endpoints (Auth Required)
- `GET /api/admin/stats` - Get faucet statistics
- `GET /api/admin/logs` - Get request logs
- `GET /api/admin/analytics` - Get detailed analytics

## Rate Limits

- **IP Address**: 10 requests per 24 hours
- **Wallet Address**: 1 request per 24 hours
- **Amount**: 10 SUI per successful request
