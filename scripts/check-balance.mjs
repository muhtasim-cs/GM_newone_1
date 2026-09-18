import { createPublicClient, http, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';

const client = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
});

const deployerAddress = '0x9048648B1109Ea88d24016e7DAf6e5032316d29F';

try {
  const balance = await client.getBalance({ address: deployerAddress });
  console.log(`Address: ${deployerAddress}`);
  console.log(`Balance: ${formatEther(balance)} ETH`);
} catch (err) {
  console.error('Error querying balance:', err.message);
}
