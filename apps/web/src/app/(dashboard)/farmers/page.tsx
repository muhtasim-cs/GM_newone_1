"use client";

import { useState } from "react";
import { Users, CheckCircle2, MapPin, Phone, Mail, Award, Search, ShieldCheck, Sprout } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const MOCK_FARMERS = [
  {
    id: "f-1",
    name: "Mohammad Rahim Uddin",
    businessName: "Green Valley Agro",
    district: "Bogura",
    experience: "14 Years",
    crops: ["Boro Rice", "Potato", "Mustard"],
    verified: true,
    totalFunded: "৳12.5L",
    cyclesCompleted: 8,
    repaymentRate: "100%",
  },
  {
    id: "f-2",
    name: "Golam Mostafa",
    businessName: "Padma Fishery & Hatchery",
    district: "Chandpur",
    experience: "9 Years",
    crops: ["Hilsa", "Rui", "Catla"],
    verified: true,
    totalFunded: "৳18.0L",
    cyclesCompleted: 6,
    repaymentRate: "100%",
  },
  {
    id: "f-3",
    name: "Abul Kalam Azad",
    businessName: "Brahmaputra Organic Farm",
    district: "Mymensingh",
    experience: "11 Years",
    crops: ["Black Bengal Goat", "Dairy"],
    verified: true,
    totalFunded: "৳8.5L",
    cyclesCompleted: 5,
    repaymentRate: "100%",
  },
  {
    id: "f-4",
    name: "Nurul Islam",
    businessName: "Rangpur Maize Co-Op",
    district: "Rangpur",
    experience: "7 Years",
    crops: ["Maize", "Groundnut"],
    verified: true,
    totalFunded: "৳6.0L",
    cyclesCompleted: 4,
    repaymentRate: "100%",
  },
];

export default function FarmersPage() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_FARMERS.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.district.toLowerCase().includes(search.toLowerCase()) ||
      f.businessName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Verified Partner Farmers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse vetted agricultural producers with verified track records and Shariah compliance
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search farmers or district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((farmer) => (
          <Card key={farmer.id} className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg font-bold text-foreground">
                      {farmer.name}
                    </CardTitle>
                    {farmer.verified && (
                      <Badge className="bg-primary text-white text-[10px] px-1.5 py-0.5">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Vetted
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs font-semibold text-primary">
                    {farmer.businessName}
                  </CardDescription>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3.5 w-3.5" /> {farmer.district}, Bangladesh &middot; {farmer.experience} exp.
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {farmer.name.split(" ")[0][0]}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {farmer.crops.map((crop) => (
                  <Badge key={crop} variant="secondary" className="text-[11px] bg-muted">
                    <Sprout className="h-3 w-3 mr-1 text-primary" /> {crop}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-y text-center text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Capital Raised</span>
                  <span className="font-bold text-foreground">{farmer.totalFunded}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Cycles Done</span>
                  <span className="font-bold text-foreground">{farmer.cyclesCompleted}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Payout Rate</span>
                  <span className="font-bold text-emerald-600">{farmer.repaymentRate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">ID: {farmer.id}</span>
                <Button variant="outline" size="sm" className="text-xs font-semibold">
                  View Full Portfolio
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
