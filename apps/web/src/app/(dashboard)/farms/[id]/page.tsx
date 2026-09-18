"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sprout,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Calendar,
  CloudSun,
  Droplets,
  Wind,
  Layers,
  FileText,
  BadgeAlert,
  ArrowRight,
  ExternalLink,
  Award,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MOCK_FARMS, MOCK_DEALS } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function FarmDetailPage() {
  const params = useParams();
  const router = useRouter();
  const farmId = params?.id as string;

  const farm = useMemo(() => {
    return MOCK_FARMS.find((f) => f.id === farmId) || MOCK_FARMS[0];
  }, [farmId]);

  const relatedDeals = useMemo(() => {
    return MOCK_DEALS.filter((d) => d.farmId === farm.id);
  }, [farm.id]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Farms
        </Button>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-600 text-white gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> DAE Bangladesh Certified
          </Badge>
          <Badge variant="outline" className="border-primary/40 text-primary bg-primary/5">
            IoT & GPS Mapped
          </Badge>
        </div>
      </div>

      {/* Hero Header */}
      <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs uppercase font-semibold">
                {farm.sector}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {farm.district}, Bangladesh
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {farm.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
              Verified agricultural parcel with certified organic soil treatments, modern drip-irrigation infrastructure, and multi-crop rotation schedules.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-muted/40 rounded-xl p-3 text-center border">
              <span className="text-xs text-muted-foreground block">Land Area</span>
              <span className="text-lg font-bold text-foreground">
                {farm.sizeHectares} ha
              </span>
            </div>
            <div className="bg-muted/40 rounded-xl p-3 text-center border">
              <span className="text-xs text-muted-foreground block">Active Cycles</span>
              <span className="text-lg font-bold text-emerald-600">
                {relatedDeals.length > 0 ? relatedDeals.length : 1}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Field Audit & IoT Telemetry */}
        <div className="lg:col-span-2 space-y-6">
          {/* Field Inspection Audit Report */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> Official Agronomy Field Audit Report
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Conducted by Department of Agricultural Extension (DAE) certified agronomist
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                  Audited: Sep 2026
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 border rounded-xl bg-card">
                  <span className="text-muted-foreground block text-[10px]">Soil pH Level</span>
                  <span className="font-bold text-foreground text-sm">6.8 (Optimal)</span>
                </div>
                <div className="p-3 border rounded-xl bg-card">
                  <span className="text-muted-foreground block text-[10px]">Organic Matter</span>
                  <span className="font-bold text-emerald-600 text-sm">3.4% (Rich)</span>
                </div>
                <div className="p-3 border rounded-xl bg-card">
                  <span className="text-muted-foreground block text-[10px]">Water Salinity</span>
                  <span className="font-bold text-foreground text-sm">&lt;0.5 dS/m (Sweet)</span>
                </div>
                <div className="p-3 border rounded-xl bg-card">
                  <span className="text-muted-foreground block text-[10px]">Flood Elevation</span>
                  <span className="font-bold text-emerald-600 text-sm">+3.2m High Zone</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border bg-muted/20 text-xs space-y-2">
                <h4 className="font-bold text-foreground">Lead Inspector Assessment</h4>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  &ldquo;The farm demonstrates exemplary drainage channels, high-nitrogen loamy silt soil, and adherence to bio-safe organic pest management. Suitable for high-density Boro cultivation and year-round aquaculture.&rdquo;
                </p>
                <div className="flex items-center justify-between text-[11px] pt-1 text-muted-foreground">
                  <span>Inspector: <strong>Dr. Rafiqul Islam</strong> (DAE Agronomist)</span>
                  <span className="font-mono">Cert #DAE-BG-99214</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* IoT & Weather Telemetry */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CloudSun className="h-4 w-4 text-primary" /> Live Farm Telemetry & Climate Monitoring
              </CardTitle>
              <CardDescription className="text-xs">
                Automated field sensors transmitting micro-climate conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 border rounded-xl bg-surface">
                  <Droplets className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                  <span className="text-muted-foreground block text-[10px]">Soil Moisture</span>
                  <span className="font-bold text-foreground text-sm">62% Adequate</span>
                </div>
                <div className="p-3 border rounded-xl bg-surface">
                  <CloudSun className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                  <span className="text-muted-foreground block text-[10px]">Avg Ambient Temp</span>
                  <span className="font-bold text-foreground text-sm">29.4 &deg;C</span>
                </div>
                <div className="p-3 border rounded-xl bg-surface">
                  <Wind className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                  <span className="text-muted-foreground block text-[10px]">Monsoon Risk Index</span>
                  <span className="font-bold text-emerald-600 text-sm">Low (Tier 1)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Associated Deals & Farmer Profile */}
        <div className="space-y-6">
          {/* Active Deals on this farm */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sprout className="h-4 w-4 text-primary" /> Linked Investment Deals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {relatedDeals.length === 0 && (
                <div className="p-3 text-center text-xs text-muted-foreground">
                  No active public deals currently open on this farm.
                </div>
              )}
              {relatedDeals.map((deal) => (
                <div key={deal.id} className="p-3 border rounded-xl bg-card space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <h5 className="font-bold text-foreground">{deal.title}</h5>
                    <Badge variant="outline" className="text-[10px] text-amber-700 bg-amber-50">
                      {deal.expectedReturnPct}% ROI
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {deal.description}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t">
                    <span className="text-muted-foreground text-[10px]">{deal.durationMonths} Months</span>
                    <Button asChild size="sm" className="h-7 text-xs gap-1 text-white" style={{ background: "linear-gradient(135deg, #015546 0%, #0A7A5A 100%)" }}>
                      <Link href={`/deals/${deal.id}`}>
                        View Deal <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Legal & Tenure Security */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" /> Land Tenure & Legal Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5 text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Ownership Deeds Verified by Local Sub-Registry
              </p>
              <p className="flex items-center gap-1.5 text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Zero Encumbrances or Bank Mortgages
              </p>
              <p className="flex items-center gap-1.5 text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Shariah-Compliant Leased Partnership Agreement
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
