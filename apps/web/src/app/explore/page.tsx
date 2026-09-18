"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sprout,
  Search,
  Filter,
  ShieldCheck,
  MapPin,
  TrendingUp,
  Clock,
  ArrowRight,
  Coins,
  CheckCircle2,
  Lock,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { MOCK_DEALS } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function ExploreProjectsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedDistrict, setSelectedDistrict] = useState("ALL");

  const districts = ["ALL", ...Array.from(new Set(MOCK_DEALS.map((d) => d.district)))];

  const filteredDeals = MOCK_DEALS.filter((deal) => {
    const matchesSearch =
      deal.title.toLowerCase().includes(search.toLowerCase()) ||
      deal.district.toLowerCase().includes(search.toLowerCase()) ||
      deal.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "ALL" || deal.category === selectedCategory;
    const matchesDist = selectedDistrict === "ALL" || deal.district === selectedDistrict;
    return matchesSearch && matchesCat && matchesDist;
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ── Top Public Header ── */}
      <header className="sticky top-0 z-50 border-b border-white/10" style={{ background: "rgba(1,85,70,0.95)", backdropFilter: "blur(16px)" }}>
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 border border-white/25">
              <Sprout className="h-5 w-5 text-white" />
            </span>
            <div>
              <span className="block text-[15px] font-bold tracking-tight text-white leading-none">
                GRAMBONDHON
              </span>
              <span className="block text-[10px] text-white/60 leading-none mt-0.5">
                গ্রামবন্ধন
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex text-sm font-medium text-white/80">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/explore" className="text-white font-bold border-b-2 border-gb-amber pb-0.5">Active Projects</Link>
            <Link href="/about" className="hover:text-white transition-colors">About & Shariah</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #C8902A 0%, #F5A623 100%)" }}
            >
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Banner ── */}
      <section className="border-b bg-gradient-to-b from-primary/5 via-background to-background py-12 px-4 sm:px-8">
        <div className="container mx-auto max-w-5xl text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <ShieldCheck className="h-4 w-4" /> 100% Shariah Verified Agri-Deals
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
            Explore Halal Agricultural Projects
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Support Bangladeshi farming communities through genuine profit-sharing contracts (Musharakah).
            All investments are backed by real agricultural yields and tracked on-chain.
          </p>
        </div>
      </section>

      {/* ── Filter & Projects Section ── */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-8 py-10 space-y-8">
        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-2xl border bg-card/60 shadow-sm">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by crop, region, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5">
              {["ALL", "CROPS", "AQUACULTURE", "LIVESTOCK"].map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs h-8 ${selectedCategory === cat ? "bg-primary text-white font-bold" : ""}`}
                >
                  {cat === "ALL" ? "All Sectors" : cat.charAt(0) + cat.slice(1).toLowerCase()}
                </Button>
              ))}
            </div>

            {/* District dropdown */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {districts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist === "ALL" ? "All Districts" : dist}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.length === 0 ? (
            <div className="col-span-full py-16 text-center text-muted-foreground">
              No agricultural projects match your current filters. Try resetting the search terms.
            </div>
          ) : (
            filteredDeals.map((deal) => {
              const pctFunded = Math.min(100, Math.round((deal.fundedAmount / deal.fundingGoal) * 100));

              return (
                <Card key={deal.id} className="border-border/70 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-800 border-emerald-200">
                        {deal.category}
                      </Badge>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        {deal.expectedReturnPct}% ROI Est.
                      </span>
                    </div>
                    <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {deal.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1.5 text-xs">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {deal.district}, Bangladesh
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-1">
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {deal.description}
                    </p>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-muted-foreground">Funded ({pctFunded}%)</span>
                        <span className="text-foreground font-semibold">
                          {formatCurrency(deal.fundedAmount)} / {formatCurrency(deal.fundingGoal)}
                        </span>
                      </div>
                      <Progress value={pctFunded} className="h-2 bg-muted" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                      <div className="bg-surface p-2 rounded-lg">
                        <span className="text-muted-foreground block text-[10px]">Min. Investment</span>
                        <span className="font-bold text-foreground">{formatCurrency(deal.minInvestment)}</span>
                      </div>
                      <div className="bg-surface p-2 rounded-lg">
                        <span className="text-muted-foreground block text-[10px]">Cycle Length</span>
                        <span className="font-bold text-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3 text-primary" />
                          {deal.durationMonths} Months
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-3 border-t bg-muted/20 flex gap-2">
                    <Button
                      asChild
                      className="w-full text-white font-bold text-xs shadow-sm hover:opacity-95"
                      style={{ background: "linear-gradient(135deg, #015546 0%, #0A7A5A 100%)" }}
                    >
                      <Link href={`/deals/${deal.id}`}>
                        Invest & View Details <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>
      </section>

      {/* ── Public Footer ── */}
      <footer className="mt-auto border-t bg-card py-8 px-4 sm:px-8">
        <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-white font-bold text-xs">
              GB
            </span>
            <span>&copy; 2026 GRAMBONDHON (গ্রামবন্ধন). All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <Link href="/about" className="hover:text-foreground">Shariah Governance</Link>
            <Link href="/login" className="hover:text-foreground">Investor Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
