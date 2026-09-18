"use client";

import { FileText, Download, ShieldCheck, CheckCircle2, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const MOCK_DOCS = [
  {
    id: "doc-1",
    title: "Mudarabah Halal Investment Master Agreement",
    type: "Legal Contract",
    signed: true,
    date: "Signed Jan 10, 2026",
  },
  {
    id: "doc-2",
    title: "National ID (NID) & KYC Verification Certificate",
    type: "Identity Document",
    signed: true,
    date: "Verified Dec 20, 2025",
  },
  {
    id: "doc-3",
    title: "Crop Loss Mitigation & Shariah Reserve Fund Policy",
    type: "Platform Policy",
    signed: false,
    date: "Published Nov 15, 2025",
  },
];

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Legal Agreements & Documents
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Access your signed Mudarabah contracts, tax certificates, and verification documents
          </p>
        </div>
        <Button variant="outline" className="text-xs font-semibold">
          <Upload className="mr-2 h-4 w-4" /> Upload Supporting Doc
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_DOCS.map((doc) => (
          <Card key={doc.id} className="border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[11px] bg-muted">
                  {doc.type}
                </Badge>
                {doc.signed ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Signed & Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground text-[10px]">
                    Reference Only
                  </Badge>
                )}
              </div>
              <CardTitle className="text-base font-bold text-foreground mt-2">
                {doc.title}
              </CardTitle>
              <CardDescription className="text-xs">{doc.date}</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Button size="sm" variant="outline" className="w-full text-xs font-semibold text-primary">
                <Download className="mr-1.5 h-3.5 w-3.5" /> Download Encrypted PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
