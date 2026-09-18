import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ChainInfo = {
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
};

export interface WalletTxRecord {
  hash: string;
  dealTitle: string;
  amount: string;
  timestamp: string;
  status: "CONFIRMED" | "PENDING";
  isRealTx: boolean;
}

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  chain?: ChainInfo;
  balance: string;
  isSimulated: boolean;
  transactions: WalletTxRecord[];
  connect: (address: string, chain: ChainInfo, isSimulated?: boolean, balance?: string) => void;
  connectDemoWallet: () => void;
  disconnect: () => void;
  setChain: (chain: ChainInfo) => void;
  setConnecting: (isConnecting: boolean) => void;
  addTransaction: (tx: WalletTxRecord) => void;
}

export const DEFAULT_DEMO_CHAIN: ChainInfo = {
  id: 84532,
  name: "Base Sepolia Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
};

export const ETH_SEPOLIA_CHAIN: ChainInfo = {
  id: 11155111,
  name: "Ethereum Sepolia (Etherscan)",
  nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      address: null,
      isConnected: false,
      isConnecting: false,
      chainId: null,
      chain: undefined,
      balance: "0.00",
      isSimulated: false,
      transactions: [],
      connect: (address, chain, isSimulated = false, balance = "2.50") =>
        set({
          address,
          isConnected: true,
          isConnecting: false,
          chainId: chain.id,
          chain,
          isSimulated,
          balance,
        }),
      connectDemoWallet: (selectedChain: ChainInfo = ETH_SEPOLIA_CHAIN) =>
        set({
          address: "0x71C849C19904944983058863A716503c1E75849A",
          isConnected: true,
          isConnecting: false,
          chainId: selectedChain.id,
          chain: selectedChain,
          balance: "2.45",
          isSimulated: true,
        }),
      disconnect: () =>
        set({
          address: null,
          isConnected: false,
          isConnecting: false,
          chainId: null,
          chain: undefined,
          balance: "0.00",
          isSimulated: false,
        }),
      setChain: (chain) => set({ chain, chainId: chain.id }),
      setConnecting: (isConnecting) => set({ isConnecting }),
      addTransaction: (tx) =>
        set((state) => ({
          transactions: [tx, ...state.transactions],
        })),
    }),
    {
      name: "agrishare-wallet",
      partialize: (state) => ({
        address: state.address,
        isConnected: state.isConnected,
        chainId: state.chainId,
        chain: state.chain,
        balance: state.balance,
        isSimulated: state.isSimulated,
        transactions: state.transactions,
      }),
    }
  )
);