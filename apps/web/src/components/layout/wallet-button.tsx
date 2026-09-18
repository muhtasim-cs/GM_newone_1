"use client";

import { useEffect, useState } from "react";
import { useAccount, useDisconnect, useChainId } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useWalletStore, type ChainInfo } from "@/lib/stores/wallet.store";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, LogOut, Loader2, Sparkles } from "lucide-react";
import { truncateAddress } from "@/lib/utils";

const KNOWN_CHAINS: Record<number, { name: string; symbol: string }> = {
  1: { name: "Ethereum", symbol: "ETH" },
  8453: { name: "Base", symbol: "ETH" },
  84532: { name: "Base Sepolia", symbol: "ETH" },
  11155111: { name: "Sepolia", symbol: "ETH" },
  31337: { name: "Hardhat Local", symbol: "ETH" },
};

export function WalletButton() {
  const [mounted, setMounted] = useState(false);
  const { address: wagmiAddress, isConnected: isWagmiConnected, isConnecting } = useAccount();
  const chainId = useChainId();
  const { openConnectModal } = useConnectModal();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  const storeAddress = useWalletStore((s) => s.address);
  const isStoreConnected = useWalletStore((s) => s.isConnected);
  const isSimulated = useWalletStore((s) => s.isSimulated);
  const balance = useWalletStore((s) => s.balance);
  const connectStore = useWalletStore((s) => s.connect);
  const connectDemoWallet = useWalletStore((s) => s.connectDemoWallet);
  const disconnectStore = useWalletStore((s) => s.disconnect);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync Wagmi address & network to store when wagmi connects
  useEffect(() => {
    if (wagmiAddress && isWagmiConnected) {
      const known = KNOWN_CHAINS[chainId] ?? { name: `Chain ${chainId}`, symbol: "ETH" };
      const chainInfo: ChainInfo = {
        id: chainId,
        name: known.name,
        nativeCurrency: { name: known.name, symbol: known.symbol, decimals: 18 },
      };
      connectStore(wagmiAddress, chainInfo, false);
      toast.success("Wallet Connected", `Connected to ${truncateAddress(wagmiAddress)} on ${known.name}`);
    }
  }, [wagmiAddress, isWagmiConnected, chainId, connectStore]);

  const activeAddress = isWagmiConnected ? wagmiAddress : storeAddress;
  const isConnected = (isWagmiConnected && !!wagmiAddress) || isStoreConnected;

  const handleDisconnect = () => {
    try {
      if (isWagmiConnected) wagmiDisconnect();
    } catch {
      // ignore
    }
    disconnectStore();
    toast.info("Wallet Disconnected", "Web3 wallet session has ended.");
  };

  const handleQuickDemoConnect = () => {
    connectDemoWallet();
    toast.success("Testnet Demo Wallet Connected", "Connected as 0x71C8...849A with 2.45 ETH on Base Sepolia.");
  };

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="gap-1.5 opacity-60">
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  if (isConnected && activeAddress) {
    return (
      <div className="flex items-center gap-2">
        {/* Network and Address badge */}
        <div className="flex items-center gap-1.5 rounded-lg border bg-surface/80 px-2.5 py-1 text-xs shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono font-semibold text-foreground">
            {truncateAddress(activeAddress)}
          </span>
          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300">
            {isSimulated ? "Testnet Demo" : (KNOWN_CHAINS[chainId]?.name ?? "Base Sepolia")}
          </Badge>
          {balance && (
            <span className="hidden sm:inline font-mono text-[11px] text-muted-foreground pl-1 border-l">
              {balance} ETH
            </span>
          )}
        </div>

        {/* Disconnect Button */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40"
          title="Disconnect wallet"
          onClick={handleDisconnect}
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Disconnect</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {/* Primary: Open RainbowKit Wallet Modal */}
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 border-primary/50 text-primary font-semibold hover:bg-primary hover:text-white shadow-sm"
        disabled={isConnecting}
        onClick={() => {
          if (!openConnectModal) {
            handleQuickDemoConnect();
            return;
          }
          try {
            openConnectModal();
          } catch {
            handleQuickDemoConnect();
          }
        }}
      >
        {isConnecting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wallet className="h-4 w-4" />
        )}
        Connect Wallet
      </Button>

      {/* Quick 1-Click Instant Testnet Connect */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 text-xs text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 gap-1 hidden sm:inline-flex font-medium"
        title="Connect instant Base Sepolia testnet demo wallet without extension"
        onClick={handleQuickDemoConnect}
      >
        <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
        Instant Demo
      </Button>
    </div>
  );
}

export default WalletButton;