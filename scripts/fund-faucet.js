#!/usr/bin/env node

const { SuiClient, getFullnodeUrl } = require('@mysten/sui.js/client');
const { Ed25519Keypair } = require('@mysten/sui.js/keypairs/ed25519');
const { fromB64 } = require('@mysten/sui.js/utils');

require('dotenv').config();

async function fundFaucetWallet() {
  try {
    if (!process.env.FAUCET_PRIVATE_KEY) {
      console.error('❌ FAUCET_PRIVATE_KEY not found in environment variables');
      process.exit(1);
    }

    // Initialize Sui client
    const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });

    // Get faucet address
    const privateKeyBytes = fromB64(process.env.FAUCET_PRIVATE_KEY);
    const secretKey = privateKeyBytes.length === 33 ? privateKeyBytes.slice(1) : privateKeyBytes;
    const faucetKeypair = Ed25519Keypair.fromSecretKey(secretKey);
    const faucetAddress = faucetKeypair.getPublicKey().toSuiAddress();

    console.log('🚰 Sui Testnet Faucet Funding Guide');
    console.log('=====================================\n');
    
    console.log('📍 Your Faucet Wallet Address:');
    console.log(`${faucetAddress}\n`);
    
    console.log('💰 How to fund your faucet wallet:\n');
    
    console.log('1. Visit the official Sui Testnet Faucet:');
    console.log('   🔗 https://testnet.suivision.xyz/faucet\n');
    
    console.log('2. Paste your faucet wallet address:');
    console.log(`   ${faucetAddress}\n`);
    
    console.log('3. Request testnet SUI tokens (you can request multiple times)\n');
    
    console.log('4. Alternative methods:');
    console.log('   • Discord Faucet: https://discord.gg/sui');
    console.log('   • CLI: sui client faucet');
    console.log('   • Transfer from another testnet wallet\n');
    
    console.log('5. Verify funding:');
    console.log('   Run: npm run check-faucet-balance\n');
    
    console.log('🔍 Current Balance Check:');
    console.log('=========================');
    
    const balance = await suiClient.getBalance({ owner: faucetAddress });
    const balanceInSui = Number(balance.totalBalance) / 1000000000;
    
    console.log(`Current Balance: ${balanceInSui.toFixed(9)} SUI`);
    
    if (balanceInSui < 0.5) {
      console.log('⚠️  Status: NEEDS FUNDING');
      console.log('💡 Please fund the wallet using the steps above');
    } else {
      console.log('✅ Status: ADEQUATELY FUNDED');
    }
    
    console.log('\n🔗 Explorer Link:');
    console.log(`https://testnet.suivision.xyz/account/${faucetAddress}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fundFaucetWallet();
