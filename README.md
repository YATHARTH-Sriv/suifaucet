# 🚰 Sui Faucet DApp

A clean, reliable, and user-friendly Sui Testnet Faucet DApp that helps developers quickly get testnet tokens without friction.

## ✨ Features

- **Simple Web UI**: Clean interface with wallet address input and validation
- **Sui Testnet Integration**: Direct integration with Sui testnet using `@mysten/sui.js`
- **Rate Limiting**: Per IP and wallet address rate limiting (1 request per hour)
- **Request Tracking**: Database logging of all faucet requests
- **Mobile Responsive**: Works seamlessly on all device sizes
- **Admin Dashboard**: Monitor faucet usage and statistics
- **Error Handling**: Comprehensive error handling and user feedback
- **Fast Performance**: Requests complete in under 30 seconds

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Blockchain**: Sui Testnet via `@mysten/sui.js`
- **Rate Limiting**: Redis (optional) or in-memory fallback
- **UI Components**: Radix UI primitives

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Sui CLI (for generating keypairs)

### Installation

1. **Clone and setup**:
```bash
git clone <your-repo>
cd suifaucet
npm i
npm run dev
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Setup database**:
```bash
npm run db:migrate
```

4. **Start development server**:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the faucet in action!

## 📋 Environment Variables

Create a `.env` file with the following variables:

### Required Variables

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"

# Faucet Private Key (Base64 format)
FAUCET_PRIVATE_KEY="your_base64_private_key_here"
```

### Optional Variables

```env
# Redis for distributed rate limiting
REDIS_URL="redis://username:password@host:port"

# Environment
NODE_ENV="development"
```

## 🔑 Setting up the Faucet Wallet

1. **Install Sui CLI**:
```bash
# Follow instructions at: https://docs.sui.io/guides/developer/getting-started/sui-install
```

2. **Generate a new keypair**:
```bash
sui client new-address ed25519
```

3. **Export the private key**:
```bash
sui keytool export <address> key-pair
```

4. **Add the base64 private key to `.env`**:
```env
FAUCET_PRIVATE_KEY="your_exported_base64_key"
```

5. **Fund the wallet**:
   - Use the official Sui testnet faucet to fund your faucet wallet
   - Or request tokens from the Sui Discord

## 🗄️ Database Setup Options

### Option 1: Railway.app (Recommended)
1. Go to [railway.app](https://railway.app)
2. Create a new PostgreSQL database
3. Copy the connection string to `DATABASE_URL`

### Option 2: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get the database URL from project settings

### Option 3: Neon.tech
1. Go to [neon.tech](https://neon.tech)
2. Create a new database
3. Copy the connection string

### Option 4: Local PostgreSQL
```bash
# Install PostgreSQL locally
# Create database
createdb suifaucet
# Update DATABASE_URL in .env
```

## 📊 API Endpoints

### POST /api/faucet
Request testnet tokens for a wallet address.

**Request**:
```json
{
  "walletAddress": "0x1234567890abcdef..."
}
```

**Response**:
```json
{
  "message": "Successfully sent 1 SUI to 0x1234...",
  "txHash": "transaction_hash",
  "amount": 1000000000,
  "explorerUrl": "https://testnet.suivision.xyz/txblock/..."
}
```

### GET /api/faucet
Get faucet statistics (for admin dashboard).

## 🎛️ Admin Dashboard

Access the admin dashboard at `/admin` to monitor:
- Total requests and success rate
- Recent faucet requests
- Request status distribution
- Transaction hashes and explorer links

## 🚦 Rate Limiting

- **Per IP**: 1 request per hour per IP address
- **Per Wallet**: 1 request per hour per wallet address
- **Storage**: Redis (preferred) or in-memory fallback
- **Amount**: 1 SUI (1,000,000,000 MIST) per request

## 🛡️ Security Features

- Wallet address validation (Sui format)
- Rate limiting to prevent abuse
- Request logging and monitoring
- Error handling and user feedback
- IP address tracking

## 📱 Responsive Design

- Mobile-first approach
- Clean, modern UI with Tailwind CSS
- Accessible components with Radix UI
- Loading states and error handling

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Railway
```bash
# Connect your GitHub repo to Railway
# Set environment variables
# Deploy automatically on git push
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:deploy` - Deploy migrations to production
- `npm run db:studio` - Open Prisma Studio

## 🆘 Troubleshooting

### Common Issues

1. **"Invalid Sui wallet address"**
   - Ensure address starts with `0x` and is 66 characters long

2. **"Rate limit exceeded"**
   - Wait 1 hour before making another request

3. **"Faucet is temporarily out of funds"**
   - The faucet wallet needs more SUI tokens

4. **Database connection issues**
   - Verify DATABASE_URL is correct
   - Run `npm run db:migrate`

5. **Faucet not configured**
   - Set FAUCET_PRIVATE_KEY in .env
   - Ensure the private key is in base64 format

---

Built with ❤️ for the Sui ecosystem
