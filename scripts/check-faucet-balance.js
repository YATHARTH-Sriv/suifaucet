#!/usr/bin/env node

const { SuiClient, getFullnodeUrl } = require('@mysten/sui.js/client');
const { Ed25519Keypair } = require('@mysten/sui.js/keypairs/ed25519');
const { fromB64 } = require('@mysten/sui.js/utils');

require('dotenv').config();

async function checkFaucetBalance() {
  try {
    // Check if private key is configured
    if (!process.env.FAUCET_PRIVATE_KEY) {
      console.error('❌ FAUCET_PRIVATE_KEY not found in environment variables');
      console.log('Please set FAUCET_PRIVATE_KEY in your .env file');
      process.exit(1);
    }

    // Initialize Sui client
    const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });

    // Initialize faucet keypair
    const privateKeyBytes = fromB64(process.env.FAUCET_PRIVATE_KEY);
    const secretKey = privateKeyBytes.length === 33 ? privateKeyBytes.slice(1) : privateKeyBytes;
    const faucetKeypair = Ed25519Keypair.fromSecretKey(secretKey);
    const faucetAddress = faucetKeypair.getPublicKey().toSuiAddress();

    console.log('🔍 Checking faucet wallet...');
    console.log(`📍 Faucet Address: ${faucetAddress}`);

    // Get balance
    const balance = await suiClient.getBalance({
      owner: faucetAddress,
    });

    const balanceInSui = Number(balance.totalBalance) / 1000000000; // Convert MIST to SUI
    const faucetAmountInSui = 0.5; // 0.5 SUI per request
    const requestsRemaining = Math.floor(balanceInSui / faucetAmountInSui);

    console.log('\n💰 Balance Information:');
    console.log(`Balance (MIST): ${balance.totalBalance}`);
    console.log(`Balance (SUI): ${balanceInSui.toFixed(9)}`);
    console.log(`Faucet amount per request: ${faucetAmountInSui} SUI`);
    console.log(`Requests remaining: ${requestsRemaining}`);

    if (balanceInSui < faucetAmountInSui) {
      console.log('\n⚠️  WARNING: Insufficient balance for faucet requests!');
      console.log('The faucet wallet needs to be topped up.');
      console.log('\n💡 To fund the faucet wallet:');
      console.log('1. Visit https://testnet.suivision.xyz/faucet');
      console.log('2. Request testnet SUI tokens for this address:');
      console.log(`   ${faucetAddress}`);
      console.log('3. Or transfer SUI from another testnet wallet');
    } else {
      console.log('\n✅ Faucet wallet has sufficient balance');
    }

    // Get coins information
    const coins = await suiClient.getCoins({
      owner: faucetAddress,
      coinType: '0x2::sui::SUI',
    });

    console.log('\n🪙 Coin Objects:');
    console.log(`Number of coin objects: ${coins.data.length}`);
    
    if (coins.data.length > 0) {
      coins.data.forEach((coin, index) => {
        const coinBalance = Number(coin.balance) / 1000000000;
        console.log(`  Coin ${index + 1}: ${coinBalance.toFixed(9)} SUI (${coin.balance} MIST)`);
      });
    }

    console.log('\n🔗 Explorer Link:');
    console.log(`https://testnet.suivision.xyz/account/${faucetAddress}`);

  } catch (error) {
    console.error('❌ Error checking faucet balance:', error.message);
    process.exit(1);
  }
}

// Run the check
checkFaucetBalance();
