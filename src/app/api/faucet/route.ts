import { NextRequest, NextResponse } from 'next/server'
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client'
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519'
import { TransactionBlock } from '@mysten/sui.js/transactions'
import { fromB64 } from '@mysten/sui.js/utils'
import { PrismaClient } from '@prisma/client'
import { createClient } from 'redis'

const prisma = new PrismaClient()

// Initialize Sui client for testnet
const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') })

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds
const FAUCET_AMOUNT = 1000000000 // 1 SUI in MIST (1 SUI = 10^9 MIST)

// Initialize Redis client (optional, falls back to in-memory if not available)
let redisClient: ReturnType<typeof createClient> | null = null
if (process.env.REDIS_URL) {
  redisClient = createClient({ url: process.env.REDIS_URL })
  redisClient.connect().catch(() => {
    console.warn('Redis connection failed, using in-memory rate limiting')
    redisClient = null
  })
}

// In-memory rate limiting fallback
const inMemoryStore = new Map<string, number>()

async function checkRateLimit(key: string): Promise<boolean> {
  const now = Date.now()
  
  if (redisClient) {
    try {
      const lastRequest = await redisClient.get(key)
      if (lastRequest && (now - parseInt(lastRequest)) < RATE_LIMIT_WINDOW) {
        return false
      }
      await redisClient.setEx(key, Math.ceil(RATE_LIMIT_WINDOW / 1000), now.toString())
      return true
    } catch (error) {
      console.warn('Redis error, falling back to in-memory:', error)
    }
  }

  // Fallback to in-memory
  const lastRequest = inMemoryStore.get(key)
  if (lastRequest && (now - lastRequest) < RATE_LIMIT_WINDOW) {
    return false
  }
  inMemoryStore.set(key, now)
  
  // Clean up old entries
  for (const [k, v] of inMemoryStore.entries()) {
    if (now - v > RATE_LIMIT_WINDOW) {
      inMemoryStore.delete(k)
    }
  }
  
  return true
}

function validateSuiAddress(address: string): boolean {
  const suiAddressRegex = /^0x[a-fA-F0-9]{64}$/
  return suiAddressRegex.test(address)
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json()

    // Validate wallet address
    if (!walletAddress || !validateSuiAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid Sui wallet address' },
        { status: 400 }
      )
    }

    // Get client information
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Check rate limits
    const ipKey = `ip:${clientIP}`
    const walletKey = `wallet:${walletAddress}`

    const ipAllowed = await checkRateLimit(ipKey)
    const walletAllowed = await checkRateLimit(walletKey)

    if (!ipAllowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded for this IP address. Please try again later.' },
        { status: 429 }
      )
    }

    if (!walletAllowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded for this wallet address. Please try again later.' },
        { status: 429 }
      )
    }

    // Check if faucet private key is configured
    if (!process.env.FAUCET_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'Faucet not configured. Please contact administrator.' },
        { status: 500 }
      )
    }

    // Create database record
    const faucetRequest = await prisma.faucetRequest.create({
      data: {
        walletAddress,
        amount: BigInt(FAUCET_AMOUNT),
        ipAddress: clientIP,
        userAgent,
        status: 'pending'
      }
    })

    try {
      // Initialize faucet keypair
      const privateKeyBytes = fromB64(process.env.FAUCET_PRIVATE_KEY!)
      
      // Sui private keys are 32 bytes, but sometimes exported with extra prefix byte
      const secretKey = privateKeyBytes.length === 33 ? privateKeyBytes.slice(1) : privateKeyBytes
      
      const faucetKeypair = Ed25519Keypair.fromSecretKey(secretKey)
      
      const faucetAddress = faucetKeypair.getPublicKey().toSuiAddress()

      // Check faucet balance
      const faucetBalance = await suiClient.getBalance({
        owner: faucetAddress,
      })

      const balanceInSui = Number(faucetBalance.totalBalance) / 1000000000
      const requestAmountInSui = FAUCET_AMOUNT / 1000000000

      console.log(`Faucet Address: ${faucetAddress}`)
      console.log(`Faucet Balance: ${balanceInSui} SUI (${faucetBalance.totalBalance} MIST)`)
      console.log(`Request Amount: ${requestAmountInSui} SUI (${FAUCET_AMOUNT} MIST)`)

      if (BigInt(faucetBalance.totalBalance) < BigInt(FAUCET_AMOUNT)) {
        await prisma.faucetRequest.update({
          where: { id: faucetRequest.id },
          data: {
            status: 'failed',
            errorMessage: `Insufficient faucet balance. Available: ${balanceInSui} SUI, Required: ${requestAmountInSui} SUI`
          }
        })

        return NextResponse.json(
          { 
            error: 'Faucet is temporarily out of funds. Please try again later.',
            details: {
              availableBalance: `${balanceInSui} SUI`,
              requiredAmount: `${requestAmountInSui} SUI`,
              faucetAddress: faucetAddress
            }
          },
          { status: 503 }
        )
      }

      // Create and execute transaction
      const txb = new TransactionBlock()
      
      const [coin] = txb.splitCoins(txb.gas, [txb.pure(FAUCET_AMOUNT)])
      txb.transferObjects([coin], txb.pure(walletAddress))

      const result = await suiClient.signAndExecuteTransactionBlock({
        transactionBlock: txb,
        signer: faucetKeypair,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      })

      // Update database record with success
      await prisma.faucetRequest.update({
        where: { id: faucetRequest.id },
        data: {
          status: 'completed',
          txHash: result.digest,
          completedAt: new Date()
        }
      })

      return NextResponse.json({
        message: `Successfully sent 1 SUI to ${walletAddress}`,
        txHash: result.digest,
        amount: FAUCET_AMOUNT,
        explorerUrl: `https://testnet.suivision.xyz/txblock/${result.digest}`
      })

    } catch (txError: unknown) {
      console.error('Transaction error:', txError)
      
      let errorMessage = 'Transaction failed'
      let errorDetails = {}
      
      if (txError instanceof Error) {
        errorMessage = txError.message
        
        // Check for specific Sui error types
        if (txError.message.includes('InsufficientCoinBalance')) {
          errorMessage = 'Insufficient balance in faucet wallet'
          errorDetails = {
            type: 'InsufficientBalance',
            suggestion: 'The faucet wallet needs to be funded with more SUI tokens'
          }
        } else if (txError.message.includes('InvalidGasObject')) {
          errorMessage = 'Invalid gas object or insufficient gas'
          errorDetails = {
            type: 'GasError',
            suggestion: 'Gas coin is invalid or insufficient for transaction'
          }
        }
      }
      
      // Update database record with detailed error
      await prisma.faucetRequest.update({
        where: { id: faucetRequest.id },
        data: {
          status: 'failed',
          errorMessage: errorMessage
        }
      })

      return NextResponse.json(
        { 
          error: 'Failed to send tokens. Please try again.',
          details: errorDetails,
          technicalError: errorMessage
        },
        { status: 500 }
      )
    }

  } catch (error: unknown) {
    console.error('Faucet error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get faucet statistics
    const stats = await prisma.faucetRequest.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    const totalRequests = await prisma.faucetRequest.count()
    const recentRequests = await prisma.faucetRequest.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        walletAddress: true,
        amount: true,
        status: true,
        createdAt: true,
        txHash: true
      }
    })

    return NextResponse.json({
      totalRequests,
      stats,
      recentRequests: recentRequests.map((req: {
        id: string;
        walletAddress: string;
        amount: bigint;
        status: string;
        createdAt: Date;
        txHash: string | null;
      }) => ({
        ...req,
        walletAddress: `${req.walletAddress.slice(0, 6)}...${req.walletAddress.slice(-4)}`,
        amount: req.amount.toString()
      }))
    })

  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
