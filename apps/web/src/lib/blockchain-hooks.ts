"use client";

import { useCallback, useMemo, useState } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatEther, formatUnits, type Address, type Hash } from "viem";
import { CONTRACT_ADDRESSES } from "@gm/blockchain-sdk";
import { useToast } from "@/components/ui/toast";
import { getExplorerUrl } from "./wagmi";

export interface Investment {
  id: string;
  dealId: string;
  investorAddress: string;
  units: number;
  amount: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "REFUNDED";
  blockchainTxHash?: string;
  blockchainInvestmentId?: string;
  profitPaid: boolean;
  createdAt: string;
  deal?: {
    id: string;
    projectId: string;
    fundingTarget: string;
    unitPrice: string;
    status: string;
  };
}

export interface ProfitDistribution {
  id: string;
  dealId: string;
  totalAmount: string;
  investorShare: string;
  farmerShare: string;
  platformFee: string;
  status: string;
  payments: ProfitPayment[];
  createdAt: string;
}

export interface ProfitPayment {
  id: string;
  dealId: string;
  investorAddress: string;
  amount: string;
  txHash: string;
  status: string;
  createdAt: string;
}

export function useBlockchainWallet() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { data: balance } = useBalance({ address });

  const shortAddress = useMemo(() => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  const formattedBalance = useMemo(() => {
    if (!balance) return "0.00";
    return formatEther(balance.value);
  }, [balance]);

  const connectWallet = useCallback(
    (connectorIndex: number = 0) => {
      const connector = connectors[connectorIndex];
      if (connector) {
        connect({ connector });
      }
    },
    [connect, connectors],
  );

  const ensureCorrectChain = useCallback(
    async (targetChainId: number): Promise<boolean> => {
      if (chainId === targetChainId) return true;
      try {
        await switchChainAsync({ chainId: targetChainId });
        return true;
      } catch (error) {
        console.error("Failed to switch chain:", error);
        return false;
      }
    },
    [chainId, switchChainAsync],
  );

  return {
    address,
    isConnected,
    isConnecting,
    chainId,
    shortAddress,
    formattedBalance,
    connectWallet,
    disconnect,
    ensureCorrectChain,
    connectors,
  };
}

export function useInvestmentActions() {
  const { address, chainId } = useAccount();
  const {
    writeContractAsync,
    isPending: isWritePending,
    data: txHash,
  } = useWriteContract();
  const { isConnected } = useAccount();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash as Hash | undefined,
    });

  const invest = useCallback(
    async (dealId: string, units: number, unitPriceWei: bigint) => {
      if (!address || !isConnected) {
        throw new Error("Wallet not connected");
      }

      const totalValue = unitPriceWei * BigInt(units);
      const dealContractAddress = CONTRACT_ADDRESSES.dealFactory;

      const hash = await writeContractAsync({
        address: dealContractAddress as Address,
        abi: [
          {
            type: "function",
            name: "invest",
            inputs: [
              { name: "units", type: "uint256" },
            ],
            outputs: [],
            stateMutability: "payable",
          },
        ],
        functionName: "invest",
        args: [BigInt(units)],
        value: totalValue,
      });

      return hash;
    },
    [address, isConnected, writeContractAsync],
  );

  return {
    invest,
    isWritePending,
    isConfirming,
    isConfirmed,
    txHash,
  };
}

export function useTransactionStatus(txHash?: Hash) {
  const { data: receipt, isLoading, isSuccess, isError } =
    useWaitForTransactionReceipt({
      hash: txHash,
      pollingInterval: 2_000,
    });

  const status = useMemo(() => {
    if (!txHash) return "idle";
    if (isLoading) return "pending";
    if (isSuccess && receipt) {
      return receipt.status === "success" ? "success" : "reverted";
    }
    if (isError) return "error";
    return "pending";
  }, [txHash, isLoading, isSuccess, isError, receipt]);

  return {
    status,
    receipt,
    blockNumber: receipt?.blockNumber,
    gasUsed: receipt?.gasUsed,
  };
}
