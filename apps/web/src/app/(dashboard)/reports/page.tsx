"use client";

import { BarChart3, Download, FileText, TrendingUp, Calendar, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const MOCK_REPORTS = [
  {
    id: "rep-1",
    title: "Q4 2025 Agricultural Yield & Payout Audit",
    category: "Financial Audit",
    date: "Jan 10, 2026",
    size: "2.4 MB",
    downloads: 142,
  },
  {
    id: "rep-2",
    title: "Bogura District Soil Moisture & Seed Viability Analysis",
    category: "Agronomic Report",
    date: "Feb 05, 2026",
    size: "5.1 MB",
    downloads: 98,
  },
  {
    id: "rep-3",
    title: "Halal Compliance & Shariah Board Annual Certification 2025",
    category: "Compliance",
    date: "Dec 28, 2025",
    size: "1.8 MB",
    downloads: 310,
  },
  {
    id: "rep-4",
    title: "Hilsa Fishery Recirculating Aquaculture Environmental Impact",
    category: "ESG & Sustainability",
    date: "Feb 20, 2026",
    size: "3.7 MB",
    downloads: 64,
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Audit Reports & Yield Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Official performance audits, Shariah certifications, and agronomic yield studies
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_REPORTS.map((r) => (
          <Card key={r.id} className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-1.5">
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-800 border-emerald-200">
                  {r.category}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {r.date}
                </span>
              </div>
              <CardTitle className="text-base font-bold text-foreground">
                {r.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between pt-1 text-xs">
              <span className="text-muted-foreground">PDF Document &middot; {r.size}</span>
              <Button size="sm" variant="outline" className="text-primary font-semibold text-xs">
                <Download className="mr-1.5 h-3.5 w-3.5" /> Download PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
