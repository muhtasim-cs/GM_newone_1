import fs from 'node:fs';
import path from 'node:path';
import { createPublicClient, createWalletClient, http, formatEther } from 'viem';
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';

const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || 'https://sepolia.base.org';
const compiledPath = path.resolve('contracts/out/compiled.json');

if (!fs.existsSync(compiledPath)) {
  console.error('compiled.json not found! Run: node scripts/compile-contracts.mjs');
  process.exit(1);
}

const compiled = JSON.parse(fs.readFileSync(compiledPath, 'utf8'));
const agriPlatformData = compiled.contracts['AgriPlatform.sol']?.['AgriPlatform'];

if (!agriPlatformData) {
  console.error('AgriPlatform bytecode not found in compiled.json');
  process.exit(1);
}

const abi = agriPlatformData.abi;
const bytecode = '0x' + agriPlatformData.evm.bytecode.object;

async function main() {
  console.log('\n======================================================');
  console.log('🌿 GramBondhon Base Sepolia Smart Contract Deployer');
  console.log('🔗 Network: Base Sepolia Testnet (Chain ID 84532)');
  console.log('🌐 RPC:', RPC_URL);
  console.log('======================================================\n');

  let privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  
  if (!privateKey || privateKey.trim() === '') {
    const envPath = path.resolve('apps/api/.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/BLOCKCHAIN_PRIVATE_KEY=([^\r\n]+)/);
      if (match && match[1]?.trim()) {
        privateKey = match[1].trim();
      }
    }
  }

  if (!privateKey || privateKey.trim() === '') {
    console.warn('⚠️ No BLOCKCHAIN_PRIVATE_KEY found in environment or .env.');
    const generated = generatePrivateKey();
    const tempAccount = privateKeyToAccount(generated);
    console.log('\n🔑 Generated new deployer key:');
    console.log('   Private Key:', generated);
    console.log('   Wallet Address:', tempAccount.address);
    console.log('   BaseScan Link: https://sepolia.basescan.org/address/' + tempAccount.address);
    console.log('\n👉 To fund this address with testnet ETH:');
    console.log('   1. https://www.alchemy.com/faucets/base-sepolia');
    console.log('   2. https://faucets.chain.link/base-sepolia');
    console.log('   3. https://learnweb3.io/faucets/base_sepolia\n');
    console.log('Then save it in apps/api/.env as:');
    console.log(`BLOCKCHAIN_PRIVATE_KEY=${generated}\n`);
    privateKey = generated;
  }

  if (!privateKey.startsWith('0x')) {
    privateKey = '0x' + privateKey;
  }

  const account = privateKeyToAccount(privateKey);
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(RPC_URL),
  });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`👤 Deployer Address: ${account.address}`);
  console.log(`💰 Current Balance: ${formatEther(balance)} ETH`);

  if (balance === 0n) {
    console.error('\n❌ Insufficient balance to deploy contract.');
    console.error(`Please send a small amount of Base Sepolia ETH (e.g. 0.005 ETH) to: ${account.address}`);
    console.error('Once funded, run: node scripts/deploy-base-sepolia.mjs\n');
    process.exit(0);
  }

  console.log('\n🚀 Deploying AgriPlatform contract to Base Sepolia...');
  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(RPC_URL),
  });

  const hash = await walletClient.deployContract({
    abi,
    bytecode,
  });

  console.log(`📨 Deployment transaction submitted!`);
  console.log(`🔗 Transaction Hash: ${hash}`);
  console.log(`🔎 BaseScan URL: https://sepolia.basescan.org/tx/${hash}`);
  console.log(`⏳ Waiting for block confirmation...`);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`\n🎉 AgriPlatform deployed successfully!`);
  console.log(`📍 Contract Address: ${receipt.contractAddress}`);
  console.log(`🧱 Block Number: #${receipt.blockNumber}`);
  console.log(`🔎 Contract on BaseScan: https://sepolia.basescan.org/address/${receipt.contractAddress}`);

  // Write to .env files automatically
  const updateEnv = (filePath) => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('AGRI_PLATFORM_ADDRESS=')) {
        content = content.replace(/AGRI_PLATFORM_ADDRESS=[^\r\n]*/, `AGRI_PLATFORM_ADDRESS=${receipt.contractAddress}`);
      } else {
        content += `\nAGRI_PLATFORM_ADDRESS=${receipt.contractAddress}\n`;
      }
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath} with AGRI_PLATFORM_ADDRESS`);
    }
  };

  updateEnv(path.resolve('.env'));
  updateEnv(path.resolve('apps/api/.env'));
  updateEnv(path.resolve('apps/web/.env.local'));
}

main().catch((err) => {
  console.error('Deployment error:', err);
  process.exit(1);
});
