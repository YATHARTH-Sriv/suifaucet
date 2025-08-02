# 🚰 Sui Faucet Configuration Guide

## Complete Setup Instructions

### 1. Database Setup (Choose One)

#### Option A: Railway.app (Recommended - Free Tier)
1. Go to https://railway.app and create account
2. Click "New Project" → "Provision PostgreSQL"
3. Copy the connection string from Variables tab
4. Update .env file:
```env
DATABASE_URL="postgresql://postgres:password@host:port/railway"
DIRECT_URL="postgresql://postgres:password@host:port/railway"
```

#### Option B: Supabase (Free Tier)
1. Go to https://supabase.com and create account
2. Create new project
3. Go to Settings → Database
4. Copy connection string
5. Update .env file with the connection string

#### Option C: Local PostgreSQL
```bash
# Install PostgreSQL
brew install postgresql  # macOS
sudo apt install postgresql  # Ubuntu

# Start service
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Ubuntu

# Create database
createdb suifaucet

# Update .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/suifaucet"
```

### 2. Sui Wallet Setup

#### Step 1: Install Sui CLI
```bash
# Install Sui CLI (choose your platform)
# For detailed instructions: https://docs.sui.io/guides/developer/getting-started/sui-install

# macOS (Homebrew)
brew install sui

# Or download from GitHub releases
# https://github.com/MystenLabs/sui/releases
```

#### Step 2: Generate Faucet Keypair
```bash
# Initialize Sui client (if first time)
sui client

# Generate new address
sui client new-address ed25519

# You'll see output like:
# Created new keypair and saved it to keystore.
# Address: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12
```

#### Step 3: Export Private Key
```bash
# Export the private key (replace with your address)
sui keytool export 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12 key-pair

# Copy the base64 private key from the output
```

#### Step 4: Fund the Wallet
```bash
# Get the faucet wallet address
sui client active-address

# Fund it using official Sui testnet faucet:
# 1. Go to https://testnet.suivision.xyz/faucet
# 2. Enter your faucet wallet address
# 3. Request tokens

# Or use Discord:
# 1. Join Sui Discord: https://discord.gg/sui
# 2. Go to #testnet-faucet channel
# 3. Type: !faucet <your-address>
```

### 3. Environment Configuration

Create `.env` file:
```env
# Database (from step 1)
DATABASE_URL="your_database_url_here"
DIRECT_URL="your_database_url_here"

# Faucet wallet (from step 2)
FAUCET_PRIVATE_KEY="your_base64_private_key_here"

# Optional: Redis for production (Upstash Redis - free tier)
# REDIS_URL="redis://default:password@host:port"

# Optional: Environment
NODE_ENV="development"
```

### 4. Final Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### 5. Testing

1. **Test the application:**
   - Open http://localhost:3000
   - Enter a valid Sui wallet address
   - Request tokens

2. **Test admin dashboard:**
   - Open http://localhost:3000/admin
   - View statistics and recent requests

3. **Test API health:**
   - Open http://localhost:3000/api/health
   - Should show all systems healthy

### 6. Production Deployment

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# In Vercel dashboard:
# 1. Go to your project settings
# 2. Add environment variables:
#    - DATABASE_URL
#    - DIRECT_URL  
#    - FAUCET_PRIVATE_KEY
#    - REDIS_URL (optional)
```

#### Railway
1. Connect GitHub repo to Railway
2. Add environment variables in dashboard
3. Deploy automatically on git push

### 7. Optional Enhancements

#### Redis Setup (for production rate limiting)
1. Go to https://upstash.com (free tier available)
2. Create Redis database
3. Copy connection string
4. Add to .env: `REDIS_URL="your_redis_url"`

#### Domain Setup
1. Purchase domain or use free subdomain
2. Configure DNS to point to your deployment
3. Enable HTTPS (automatic on Vercel/Railway)

### 8. Monitoring

- **Health Check**: GET /api/health
- **Admin Dashboard**: /admin
- **API Stats**: GET /api/faucet
- **Database**: npm run db:studio

### Troubleshooting

❌ **"Faucet not configured"**
- Check FAUCET_PRIVATE_KEY is set in .env
- Ensure private key is in base64 format

❌ **"Database connection failed"**
- Verify DATABASE_URL is correct
- Check database is running and accessible
- Run `npm run db:migrate`

❌ **"Insufficient faucet balance"**
- Fund the faucet wallet with more SUI
- Check wallet address: `sui client active-address`

❌ **"Invalid Sui wallet address"**
- Address must start with 0x
- Must be exactly 66 characters long
- Use a real Sui wallet address

### Support

- Sui Documentation: https://docs.sui.io
- Sui Discord: https://discord.gg/sui
- GitHub Issues: Create issue for bugs

---

🎉 **You're all set!** Your Sui Faucet should now be running successfully.
