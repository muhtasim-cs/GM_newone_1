"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator, ArrowRight, ShieldCheck, Coins, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

export function QuickCalculator() {
  const [amount, setAmount] = useState<number>(50000);
  const [expectedRoi, setExpectedRoi] = useState<number>(20);

  const estimatedProfit = Math.round(amount * (expectedRoi / 100));
  const totalPayout = amount + estimatedProfit;

  const quickPicks = [10000, 25000, 50000, 100000, 250000];

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-lg max-w-4xl mx-auto my-12">
      <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
        {/* Left: Inputs */}
        <div className="w-full md:w-1/2 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
            <Calculator className="h-3.5 w-3.5" /> Interactive Halal Yield Calculator
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">
              Calculate Your Harvest Return
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Estimate your projected profit based on historical Musharakah yields in Bangladesh.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Investment Amount</span>
              <span className="text-primary font-bold">{formatCurrency(amount)}</span>
            </div>
            <Input
              type="number"
              min={5000}
              step={5000}
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              className="text-base font-bold"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickPicks.map((val) => (
                <Button
                  key={val}
                  variant={amount === val ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAmount(val)}
                  className="text-[11px] h-7 px-2"
                >
                  {val >= 100000 ? `৳${val / 100000}L` : `৳${val / 1000}K`}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Calculated Yield Card */}
        <div className="w-full md:w-1/2 rounded-2xl p-6 border border-emerald-600/20 text-white relative overflow-hidden shadow-md"
          style={{ background: "linear-gradient(135deg, #015546 0%, #0A7A5A 100%)" }}
        >
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center text-xs text-white/80">
              <span>Target Harvest Cycle</span>
              <span className="font-bold text-amber-300">6–8 Months</span>
            </div>

            <div className="border-t border-white/15 pt-3">
              <span className="text-xs text-white/70 block">Estimated Net Profit (~{expectedRoi}%):</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-300">
                +{formatCurrency(estimatedProfit)}
              </span>
            </div>

            <div className="border-t border-white/15 pt-3 flex justify-between items-baseline">
              <span className="text-xs text-white/80">Total Projected Return:</span>
              <span className="text-xl font-bold text-white">
                {formatCurrency(totalPayout)}
              </span>
            </div>

            <div className="pt-2">
              <Button
                asChild
                className="w-full font-bold text-xs py-5 text-gb-forest shadow-md transition-all hover:scale-[1.01]"
                style={{ background: "linear-gradient(135deg, #C8902A 0%, #F5A623 100%)", color: "#011F18" }}
              >
                <Link href="/explore">
                  Browse Projects Matching This <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
