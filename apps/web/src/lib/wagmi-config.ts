"use client";

import { http } from "viem";
import { base, mainnet, sepolia } from "viem/chains";
import { createConfig, type Config } from "wagmi";
import { injected } from "wagmi/connectors";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";
const chainIdFromEnv = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "8453");

let config: Config;

if (projectId) {
  config = getDefaultConfig({
    appName: "AgriShare",
    projectId,
    chains: [base, mainnet, sepolia],
  });
} else {
  const chain = [base, mainnet, sepolia].find((c) => c.id === chainIdFromEnv) ?? base;
  config = createConfig({
    chains: [chain],
    connectors: [injected()],
    transports: {
      [base.id]: http(),
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
  });
}

const wagmiConfig: Config = config;

export { wagmiConfig };
export { base, mainnet, sepolia };