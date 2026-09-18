"use client";

import type { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { wagmiConfig, baseSepolia } from "@/lib/wagmi";

const grambondhonLightTheme = lightTheme({
  accentColor: "#015546",
  accentColorForeground: "#ffffff",
  borderRadius: "medium",
  fontStack: "system",
});

const grambondhonDarkTheme = darkTheme({
  accentColor: "#0A7A5A",
  accentColorForeground: "#ffffff",
  borderRadius: "medium",
  fontStack: "system",
});

export function WalletsProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider
        theme={{ lightMode: grambondhonLightTheme, darkMode: grambondhonDarkTheme }}
        modalSize="compact"
        initialChain={baseSepolia}
        appInfo={{
          appName: "GRAMBONDHON | গ্রামবন্ধন",
          learnMoreUrl: "/about",
        }}
      >
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}