"use client";

import { BarChart3, TrendingUp, Wallet, ArrowUpRight, CheckCircle2, Sprout } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Investment Portfolio Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Performance overview, asset allocation, and projected crop harvest distributions
          </p>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Invested Value</CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">৳85,000</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">In 2 verified farm projects</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Realized Profit Payouts</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">৳21,000</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+24.7% realized return</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Next Harvest Distribution</CardDescription>
            <CardTitle className="text-2xl font-bold text-primary">May 2026</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Boro Rice Cycle 1 Completion</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Shariah Compliance</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="h-5 w-5" /> 100% Halal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Audited profit-sharing</p>
          </CardContent>
        </Card>
      </div>

      {/* Allocation breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Sector Allocation</CardTitle>
            <CardDescription className="text-xs">Capital distribution across agricultural sectors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Crops (Boro Rice)</span>
                <span className="text-primary">৳50,000 (58.8%)</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "58.8%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Aquaculture (Hilsa Fishery)</span>
                <span className="text-primary">৳35,000 (41.2%)</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "41.2%" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Upcoming Dividend Schedule</CardTitle>
            <CardDescription className="text-xs">Anticipated harvest-linked payout events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3 bg-surface rounded-xl border flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground block">Boro Rice Main Harvest Payout</span>
                <span className="text-muted-foreground text-[11px]">Expected ROI: 20–22% &middot; Bogura Unit</span>
              </div>
              <Badge className="bg-primary text-white text-[10px]">May 2026</Badge>
            </div>
            <div className="p-3 bg-surface rounded-xl border flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground block">Chandpur Hilsa Fingerling Distribution</span>
                <span className="text-muted-foreground text-[11px]">Expected ROI: 22–25% &middot; Chandpur Unit</span>
              </div>
              <Badge className="bg-primary text-white text-[10px]">July 2026</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
