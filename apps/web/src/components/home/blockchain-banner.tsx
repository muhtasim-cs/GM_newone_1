"use client";

import Link from "next/link";
import { ShieldCheck, Blocks, ExternalLink, ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function BlockchainBanner() {
  return (
    <div className="border-y border-border/80 bg-muted/30 py-4 px-4 sm:px-8">
      <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="bg-primary text-white gap-1 py-1 px-2.5 text-[11px] font-semibold">
            <Blocks className="h-3.5 w-3.5" /> Base Sepolia Testnet
          </Badge>
          <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
            <span>Contract:</span>
            <a
              href="https://sepolia.basescan.org/address/0x9048648B1109Ea88d24016e7DAf6e5032316d29F"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-foreground hover:text-primary underline decoration-dotted"
              title="0x9048648B1109Ea88d24016e7DAf6e5032316d29F"
            >
              0x9048...d29F
            </a>
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
          </div>
          <span className="hidden sm:inline text-muted-foreground/60">&bull;</span>
          <span className="text-muted-foreground">
            <strong>12,480+</strong> On-Chain Immutable Agrarian Proofs Logged
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/blockchain"
            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline text-xs"
          >
            Explore Public Ledger <ArrowRight className="h-3 w-3" />
          </Link>
          <a
            href="https://sepolia.basescan.org/address/0x9048648B1109Ea88d24016e7DAf6e5032316d29F"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs"
          >
            BaseScan <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
