"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sprout,
  PlusCircle,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { MOCK_FARMS } from "@/lib/api";

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [farmId, setFarmId] = useState(MOCK_FARMS[0]?.id || "farm-1");
  const [category, setCategory] = useState("CROPS");
  const [district, setDistrict] = useState("Bogura");
  const [targetYield, setTargetYield] = useState("");
  const [budget, setBudget] = useState(500000);
  const [startDate, setStartDate] = useState("2026-03-01");
  const [harvestDate, setHarvestDate] = useState("2026-08-31");
  const [description, setDescription] = useState("");
  const [shariahType, setShariahType] = useState("MUSHARAKAH");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a project title");
      return;
    }
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Project proposal created successfully!", "Submitted for agricultural review and verification.");
      router.push("/projects");
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-muted-foreground">
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" /> Back to Projects
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 mb-2">
            <Sprout className="h-3.5 w-3.5" /> Farmer Project Proposal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Create New Farming Project
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Submit a crop or livestock production proposal for Shariah verification and crowdfunding.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Project Core Details</CardTitle>
            <CardDescription>
              Basic information about the agricultural operation and farm location.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Aman High-Yield Rice Cultivation Cycle 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="farm">Operating Farm</Label>
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
                <Label htmlFor="category">Agricultural Category</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="CROPS">Crops & Cereals (ধান/গম/শাকসবজি)</option>
                  <option value="AQUACULTURE">Aquaculture & Fisheries (মৎস্য চাষ)</option>
                  <option value="LIVESTOCK">Livestock & Poultry (গবাদি পশু/হাঁস-মুরগি)</option>
                  <option value="HORTICULTURE">Horticulture & Fruits (ফলমূল ও বাগান)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="district">District / Location</Label>
                <Input
                  id="district"
                  placeholder="e.g. Bogura, Rajshahi"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="targetYield">Projected Harvest Yield</Label>
                <Input
                  id="targetYield"
                  placeholder="e.g. 15 Metric Tons / 8,000 fish"
                  value={targetYield}
                  onChange={(e) => setTargetYield(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Financials & Timeline</CardTitle>
            <CardDescription>
              Budget requested, duration, and halal profit-sharing arrangement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="budget">Total Required Budget (BDT ৳) *</Label>
                <Input
                  id="budget"
                  type="number"
                  min={50000}
                  step={10000}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shariahType">Shariah Agreement Structure</Label>
                <select
                  id="shariahType"
                  value={shariahType}
                  onChange={(e) => setShariahType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="MUSHARAKAH">Musharakah (مشاركة - Joint Equity & Yield Sharing)</option>
                  <option value="MUDARABAH">Mudarabah (مضاربة - Capital Partner & Management)</option>
                  <option value="MURABAHAH">Murabahah (مرابحة - Cost-plus Inputs Financing)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startDate">Cycle Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="harvestDate">Estimated Harvest / Payout Date</Label>
                <Input
                  id="harvestDate"
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Project Description & Agrarian Plan</Label>
              <textarea
                id="description"
                rows={3}
                placeholder="Describe the soil preparation, seed variety, fertilization technique, and expected market distribution..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t bg-muted/20 py-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/projects">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-white font-bold"
              style={{ background: "linear-gradient(135deg, #015546 0%, #0A7A5A 100%)" }}
            >
              {isSubmitting ? "Submitting Proposal..." : "Submit Project Proposal"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
