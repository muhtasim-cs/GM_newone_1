"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Handshake,
  ShieldCheck,
  TrendingUp,
  Clock,
  Sparkles,
  Coins,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { MOCK_FARMS } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function NewDealPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [farmId, setFarmId] = useState(MOCK_FARMS[0]?.id || "farm-1");
  const [category, setCategory] = useState("CROPS");
  const [district, setDistrict] = useState("Bogura");
  const [fundingGoal, setFundingGoal] = useState(500000);
  const [minInvestment, setMinInvestment] = useState(5000);
  const [expectedRoi, setExpectedRoi] = useState(20);
  const [profitShareRate, setProfitShareRate] = useState(25);
  const [durationMonths, setDurationMonths] = useState(6);
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a deal title");
      return;
    }
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Investment deal listed successfully!", "The deal is now open for Shariah board approval.");
      router.push("/deals");
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-muted-foreground">
          <Link href="/deals">
            <ArrowLeft className="h-4 w-4" /> Back to Deals
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-800 mb-2">
            <Handshake className="h-3.5 w-3.5" /> Halal Investment Offering
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            List a New Investment Deal
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Structure an agricultural crowdfunding deal with transparent profit-sharing rates for investors.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Deal Specification</CardTitle>
            <CardDescription>
              Name, underlying farm, and agricultural sector of the campaign.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Deal Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Commercial Hilsa Breeding Pond Cohort #2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="farm">Partner Farm</Label>
                <select
                  id="farm"
                  value={farmId}
                  onChange={(e) => setFarmId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {MOCK_FARMS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.district})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="CROPS">Crops (শস্য)</option>
                  <option value="AQUACULTURE">Aquaculture (মৎস্য)</option>
                  <option value="LIVESTOCK">Livestock (পশু সম্পদ)</option>
                  <option value="HORTICULTURE">Horticulture (উদ্যান)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                placeholder="e.g. Chandpur"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Financial Targets & Yield Sharing</CardTitle>
            <CardDescription>
              Define total funding goal, ticket size, expected returns, and tenor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fundingGoal">Funding Goal (BDT ৳) *</Label>
                <Input
                  id="fundingGoal"
                  type="number"
                  min={100000}
                  step={25000}
                  value={fundingGoal}
                  onChange={(e) => setFundingGoal(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="minInvestment">Minimum Investment (BDT ৳) *</Label>
                <Input
                  id="minInvestment"
                  type="number"
                  min={1000}
                  step={1000}
                  value={minInvestment}
                  onChange={(e) => setMinInvestment(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="expectedRoi">Expected Net ROI (%)</Label>
                <Input
                  id="expectedRoi"
                  type="number"
                  min={5}
                  max={50}
                  value={expectedRoi}
                  onChange={(e) => setExpectedRoi(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="profitShare">Profit Share Rate (%)</Label>
                <Input
                  id="profitShare"
                  type="number"
                  min={5}
                  max={50}
                  value={profitShareRate}
                  onChange={(e) => setProfitShareRate(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="duration">Tenor (Months)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={3}
                  max={36}
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Deal Summary & Risk Mitigation</Label>
              <textarea
                id="description"
                rows={3}
                placeholder="Explain the revenue model, expected market sale price, and risk safeguards..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t bg-muted/20 py-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/deals">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-white font-bold"
              style={{ background: "linear-gradient(135deg, #015546 0%, #0A7A5A 100%)" }}
            >
              {isSubmitting ? "Listing Deal..." : "List Investment Deal"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
