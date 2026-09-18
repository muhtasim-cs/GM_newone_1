"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderKanban, Plus, Calendar, CheckCircle2, Clock, AlertCircle, ArrowUpRight, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

const MOCK_PROJECTS = [
  {
    id: "proj-1",
    title: "Boro Rice 2026 Cycle",
    farm: "Green Valley Farm",
    district: "Bogura",
    targetYield: "12.5 Metric Tons",
    budget: 500000,
    disbursed: 375000,
    status: "IN_PROGRESS",
    currentStage: "Vegetative / Fertilization",
    completionPct: 65,
    startDate: "Jan 15, 2026",
    expectedHarvest: "May 30, 2026",
  },
  {
    id: "proj-2",
    title: "Chandpur Hilsa Hatchery Expansion",
    farm: "Padma Riverine Fishery",
    district: "Chandpur",
    targetYield: "8,000 Fingerlings",
    budget: 800000,
    disbursed: 560000,
    status: "IN_PROGRESS",
    currentStage: "Bio-Filter Installation",
    completionPct: 70,
    startDate: "Nov 10, 2025",
    expectedHarvest: "Jul 15, 2026",
  },
  {
    id: "proj-3",
    title: "Black Bengal Pedigree Breeding Cohort",
    farm: "Mymensingh Livestock Unit",
    district: "Mymensingh",
    targetYield: "45 Kids Born",
    budget: 350000,
    disbursed: 245000,
    status: "PLANNING",
    currentStage: "Shed Sanitization & Feed Prep",
    completionPct: 35,
    startDate: "Feb 01, 2026",
    expectedHarvest: "Jan 30, 2027",
  },
];

export default function ProjectsPage() {
  const [projects] = useState(MOCK_PROJECTS);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Farming Projects & Cycles
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time milestones, input distribution, and yield progress tracking
          </p>
        </div>
        <Button
          asChild
          className="w-fit text-white font-semibold"
          style={{ background: "linear-gradient(135deg, #015546 0%, #0A7A5A 100%)" }}
        >
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" /> Create New Project
          </Link>
        </Button>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((p) => (
          <Card key={p.id} className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs">
                      {p.farm}
                    </Badge>
                    <span className="text-xs text-muted-foreground">({p.district})</span>
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    {p.title}
                  </CardTitle>
                </div>
                <Badge className={p.status === "IN_PROGRESS" ? "bg-primary text-white" : "bg-amber-100 text-amber-900"}>
                  {p.status === "IN_PROGRESS" ? "Active Cycle" : "In Preparation"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface p-3 rounded-xl border text-xs">
                <div>
                  <span className="text-muted-foreground block mb-0.5">Current Stage</span>
                  <span className="font-bold text-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-primary" /> {p.currentStage}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Budget Utilized</span>
                  <span className="font-bold text-foreground">
                    {formatCurrency(p.disbursed)} of {formatCurrency(p.budget)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Projected Yield</span>
                  <span className="font-bold text-emerald-700">{p.targetYield}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Cycle Milestones</span>
                  <span className="text-primary">{p.completionPct}% Complete</span>
                </div>
                <Progress value={p.completionPct} className="h-2" />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>Cycle: {p.startDate} &rarr; Expected Harvest: {p.expectedHarvest}</span>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 font-semibold p-0 h-auto">
                  View Field Logs <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
