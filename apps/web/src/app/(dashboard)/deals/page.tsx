"use client";

import { useState } from "react";
import { Handshake, Search, Filter, TrendingUp, Clock, MapPin, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { MOCK_DEALS } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { PaymentGatewayModal } from "@/components/payments/payment-gateway-modal";

export default function DealsPage() {
  const [deals] = useState(MOCK_DEALS);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeInvestDeal, setActiveInvestDeal] = useState<{ title: string; minInvestment: number } | null>(null);

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch = deal.title.toLowerCase().includes(search.toLowerCase()) ||
                          deal.district.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || deal.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Agricultural Investment Deals
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse verified, Shariah-compliant profit-sharing agricultural projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1.5 border-primary/30 text-primary bg-primary/5 font-semibold text-xs">
            <ShieldCheck className="mr-1.5 h-4 w-4" /> 100% Halal Verified
          </Badge>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search deals by title or district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "CROPS", "AQUACULTURE", "LIVESTOCK"].map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? "bg-primary text-white text-xs font-semibold" : "text-xs"}
            >
              {cat === "ALL" ? "All Categories" : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDeals.map((deal) => {
          const pctFunded = Math.min(100, Math.round((deal.fundedAmount / deal.fundingGoal) * 100));

          return (
            <Card key={deal.id} className="border-border/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-800 border-emerald-200">
                    {deal.category}
                  </Badge>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {deal.expectedReturnPct}% ROI Est.
                  </span>
                </div>
                <CardTitle className="text-lg font-bold text-foreground line-clamp-1">
                  {deal.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-xs">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {deal.district}, Bangladesh
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 flex-1">
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {deal.description}
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">Funded ({pctFunded}%)</span>
                    <span className="text-foreground font-semibold">
                      {formatCurrency(deal.fundedAmount)} / {formatCurrency(deal.fundingGoal)}
                    </span>
                  </div>
                  <Progress value={pctFunded} className="h-2 bg-muted" />
                </div>

                {/* Key stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                  <div className="bg-surface p-2 rounded-lg">
                    <span className="text-muted-foreground block text-[10px]">Min. Investment</span>
                    <span className="font-bold text-foreground">{formatCurrency(deal.minInvestment)}</span>
                  </div>
                  <div className="bg-surface p-2 rounded-lg">
                    <span className="text-muted-foreground block text-[10px]">Harvest Period</span>
                    <span className="font-bold text-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3 text-primary" />
                      {deal.durationMonths} Months
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2 border-t bg-muted/20">
                <Button
                  onClick={() => setActiveInvestDeal({ title: deal.title, minInvestment: deal.minInvestment })}
                  className="w-full text-white font-bold text-xs shadow-sm hover:opacity-95"
                  style={{ background: "linear-gradient(135deg, #015546 0%, #0A7A5A 100%)" }}
                >
                  Invest Now <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <PaymentGatewayModal
        isOpen={!!activeInvestDeal}
        onClose={() => setActiveInvestDeal(null)}
        defaultDeal={activeInvestDeal?.title}
        defaultAmount={activeInvestDeal?.minInvestment}
      />
    </div>
  );
}
