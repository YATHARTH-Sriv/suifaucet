import { NextResponse } from 'next/server'
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') })

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    database: false,
    suiNetwork: false,
    faucetWallet: false,
    environment: !!process.env.FAUCET_PRIVATE_KEY
  }

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = true
  } catch (error) {
    console.error('Database health check failed:', error)
  }

  // Check Sui network connection
  try {
    await suiClient.getLatestSuiSystemState()
    checks.suiNetwork = true
  } catch (error) {
    console.error('Sui network health check failed:', error)
  }

  // Check faucet wallet (if configured)
  if (process.env.FAUCET_PRIVATE_KEY) {
    try {
      const { Ed25519Keypair } = await import('@mysten/sui.js/keypairs/ed25519')
      const { fromB64 } = await import('@mysten/sui.js/utils')
      
      const privateKeyBytes = fromB64(process.env.FAUCET_PRIVATE_KEY)
      // Sui private keys are 32 bytes, but sometimes exported with extra prefix byte
      const secretKey = privateKeyBytes.length === 33 ? privateKeyBytes.slice(1) : privateKeyBytes
      
      const faucetKeypair = Ed25519Keypair.fromSecretKey(secretKey)
      const faucetAddress = faucetKeypair.getPublicKey().toSuiAddress()
      
      const balance = await suiClient.getBalance({ owner: faucetAddress })
      checks.faucetWallet = BigInt(balance.totalBalance) > 0
    } catch (error) {
      console.error('Faucet wallet health check failed:', error)
    }
  }

  const allHealthy = Object.values(checks).every(check => check === true)
  const status = allHealthy ? 200 : 503

  return NextResponse.json({
    status: allHealthy ? 'healthy' : 'unhealthy',
    checks
  }, { status })
}
