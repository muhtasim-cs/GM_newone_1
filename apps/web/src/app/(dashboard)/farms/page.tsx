"use client";

import { useState } from "react";
import { Sprout, Plus, MapPin, CheckCircle2, AlertCircle, ArrowUpRight, Ruler, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_FARMS } from "@/lib/api";

export default function FarmsPage() {
  const [farms] = useState(MOCK_FARMS);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            My Farms & Landholdings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your registered agricultural land parcels and verification records
          </p>
        </div>
        <Button
          className="w-fit text-white font-semibold"
          style={{ background: "linear-gradient(135deg, #015546 0%, #0A7A5A 100%)" }}
        >
          <Plus className="mr-2 h-4 w-4" /> Register New Farm
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Parcels</CardDescription>
            <CardTitle className="text-2xl font-bold text-primary">{farms.length} Parcels</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Across 2 districts in Bangladesh</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Cultivated Area</CardDescription>
            <CardTitle className="text-2xl font-bold text-primary">7.3 Hectares</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">18.04 acres under active management</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Verification Posture</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> 100% Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Audited by field inspection team</p>
          </CardContent>
        </Card>
      </div>

      {/* Farms List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {farms.map((farm) => (
          <Card key={farm.id} className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="mb-2 bg-emerald-50 text-emerald-800 border-emerald-200">
                    {farm.sector}
                  </Badge>
                  <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Sprout className="h-5 w-5 text-primary" />
                    {farm.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1.5 mt-1 text-xs">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {farm.district}, Bangladesh
                  </CardDescription>
                </div>
                {farm.verified ? (
                  <Badge className="bg-primary text-white text-[11px]">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-700 bg-amber-50">
                    <AlertCircle className="mr-1 h-3 w-3" /> Pending Review
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 py-3 border-y text-xs">
                <div>
                  <span className="text-muted-foreground block mb-0.5">Plot Size</span>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <Ruler className="h-3.5 w-3.5 text-primary" />
                    {farm.sizeHectares} ha ({(farm.sizeHectares * 2.471).toFixed(1)} acres)
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Registered Date</span>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {new Date(farm.createdAt).toLocaleDateString("en-BD", { year: "numeric", month: "short" })}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">ID: <span className="font-mono">{farm.id}</span></span>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs font-semibold">
                  View Soil & Yield Docs <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
