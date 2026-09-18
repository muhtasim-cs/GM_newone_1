"use client";

import { http } from "viem";
import {
  base,
  baseSepolia,
  sepolia,
  mainnet,
  hardhat,
  type Chain,
} from "viem/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

// Public fallback WalletConnect project ID for QR code connections
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64";

const LOCAL_CHAIN: Chain = {
  ...hardhat,
  name: "Local Hardhat",
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL ?? "http://127.0.0.1:8545"],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_RPC_URL ?? "http://127.0.0.1:8545"],
    },
  },
};

const SUPPORTED_CHAINS: readonly [Chain, ...Chain[]] = [
  baseSepolia,
  base,
  sepolia,
  mainnet,
  LOCAL_CHAIN,
];

// RainbowKit automatically detects and configures injected wallets, MetaMask, WalletConnect, etc.
export const wagmiConfig = getDefaultConfig({
  appName: "GRAMBONDHON",
  projectId,
  chains: SUPPORTED_CHAINS,
  transports: {
    [baseSepolia.id]: http("https://sepolia.base.org"),
    [base.id]: http("https://mainnet.base.org"),
    [sepolia.id]: http("https://rpc.sepolia.org"),
    [mainnet.id]: http("https://cloudflare-eth.com"),
    [LOCAL_CHAIN.id]: http("http://127.0.0.1:8545"),
  },
  ssr: true,
});

export { LOCAL_CHAIN, baseSepolia, sepolia, mainnet, base, SUPPORTED_CHAINS };

export function getExplorerUrl(chainId: number, txHash: string): string {
  if (chainId === baseSepolia.id) return `https://sepolia.basescan.org/tx/${txHash}`;
  if (chainId === base.id) return `https://basescan.org/tx/${txHash}`;
  if (chainId === sepolia.id) return `https://sepolia.etherscan.io/tx/${txHash}`;
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
  if (!chain || !chain.blockExplorers) return `https://sepolia.basescan.org/tx/${txHash}`;
  const explorer = Object.values(chain.blockExplorers)[0];
  return `${explorer.url}/tx/${txHash}`;
}

export function getBlockExplorerAddressUrl(chainId: number, address: string): string {
  if (chainId === baseSepolia.id) return `https://sepolia.basescan.org/address/${address}`;
  if (chainId === base.id) return `https://basescan.org/address/${address}`;
  if (chainId === sepolia.id) return `https://sepolia.etherscan.io/address/${address}`;
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
  if (!chain || !chain.blockExplorers) return `https://sepolia.basescan.org/address/${address}`;
  const explorer = Object.values(chain.blockExplorers)[0];
  return `${explorer.url}/address/${address}`;
}
