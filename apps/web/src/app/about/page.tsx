"use client";

import Link from "next/link";
import {
  Sprout,
  ShieldCheck,
  CheckCircle2,
  Users,
  Building,
  ArrowRight,
  BookOpen,
  Award,
  Globe,
  Coins,
  FileText,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AboutShariahPage() {
  const shariahBoard = [
    {
      name: "Mufti Abdullah Al-Muti",
      title: "Chairman, Shariah Supervisory Board",
      credentials: "Kamil (Hadith), Jamia Islamia; Certified Islamic Finance Scholar (AAOIFI)",
      bio: "Over 18 years advising Islamic banks and microfinance institutions across South Asia on authentic Mudarabah and Murabaha contract engineering.",
    },
    {
      name: "Dr. M. Habibur Rahman",
      title: "Senior Shariah Advisor (Agricultural Economics)",
      credentials: "Ph.D. in Islamic Economics; Former Faculty of Agricultural Economics",
      bio: "Specialist in rural socio-economic justice, agrarian contract models, and fair valuation of harvest yield distributions.",
    },
    {
      name: "Maulana Zakir Hussain",
      title: "Muamalat & Compliance Auditor",
      credentials: "Mufti & Researcher in Islamic Commercial Law; M.A. in Islamic Studies",
      bio: "Leads field audits and compliance verification to ensure zero exploitation of rural smallholders and strict adherence to agreed profit ratios.",
    },
  ];

  const pillars = [
    {
      icon: ShieldCheck,
      title: "Zero Riba (Strictly Interest-Free)",
      desc: "Capital is never loaned for fixed interest. All transactions are structured as Musharakah (joint venture) or Mudarabah (partnership).",
    },
    {
      icon: FileText,
      title: "Zero Gharar (Absolute Transparency)",
      desc: "All land parcels, crop varieties, harvest timelines, and profit-sharing percentages are disclosed and contractually locked before capital is committed.",
    },
    {
      icon: Sprout,
      title: "100% Tangible Asset-Backed",
      desc: "Every taka invested is anchored directly to physical crops in the ground, livestock in pastures, or aquaculture in rivers.",
    },
    {
      icon: Coins,
      title: "On-Chain Accountability",
      desc: "Disbursements and profit settlements are immutably logged on Base Sepolia blockchain smart contracts, providing an indisputable audit trail.",
    },
  ];

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
            <Link href="/explore" className="hover:text-white transition-colors">Active Projects</Link>
            <Link href="/about" className="text-white font-bold border-b-2 border-gb-amber pb-0.5">About & Shariah</Link>
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

      {/* ── Hero ── */}
      <section className="border-b bg-gradient-to-b from-primary/5 via-background to-background py-16 px-4 sm:px-8">
        <div className="container mx-auto max-w-4xl text-center space-y-4">
          <Badge className="bg-emerald-600 text-white gap-1.5 px-3 py-1 text-xs">
            <Award className="h-4 w-4" /> Certified Shariah Governance
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
            Ethical Agrarian Capital for Bangladesh
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            GRAMBONDHON bridges ethical investors and grassroots farmers through authentic Islamic finance principles and immutable blockchain auditability.
          </p>
        </div>
      </section>

      {/* ── Core Principles ── */}
      <section className="container mx-auto max-w-6xl px-4 sm:px-8 py-14 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Our Shariah Principles
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Every contract is modeled on historical Islamic partnership doctrines, vetted by Islamic jurists.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <Card key={idx} className="border-border/70 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-sm font-bold text-foreground">{p.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── Shariah Advisory Board ── */}
      <section className="border-t bg-muted/20 py-16 px-4 sm:px-8">
        <div className="container mx-auto max-w-6xl space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 text-xs font-semibold">
              Independent Oversight
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              The Shariah Supervisory Board
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Renowned scholars independently evaluating each agricultural deal structure and fatwa issuance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shariahBoard.map((member, idx) => (
              <Card key={idx} className="border-border/70 bg-card shadow-sm flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base mb-3 border border-emerald-300">
                    {member.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </div>
                  <CardTitle className="text-base font-bold text-foreground">{member.name}</CardTitle>
                  <CardDescription className="text-xs font-medium text-primary">
                    {member.title}
                  </CardDescription>
                  <span className="text-[11px] text-muted-foreground block pt-1 font-mono">
                    {member.credentials}
                  </span>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground leading-relaxed border-t pt-3">
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Field-to-Blockchain Flow ── */}
      <section className="container mx-auto max-w-5xl px-4 sm:px-8 py-16 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            End-to-End Field Verification Lifecycle
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            How every harvest journey transitions from fertile soil to digital audit trail.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { step: "01", title: "Field Audit", desc: "Soil, water, and farmer title verified by agronomists" },
            { step: "02", title: "Fatwa Issuance", desc: "Musharakah profit-share ratio certified by Shariah Board" },
            { step: "03", title: "Smart Contract", desc: "Capital pooled securely on Base Sepolia blockchain" },
            { step: "04", title: "Automated Return", desc: "Harvest sold at wholesale and payouts dispatched" },
          ].map((s, idx) => (
            <div key={idx} className="p-4 rounded-xl border bg-card/60 text-center space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs">
                Stage {s.step}
              </span>
              <h4 className="font-bold text-sm text-foreground">{s.title}</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center pt-4">
          <Button asChild size="lg" className="text-white font-bold gap-2 text-sm shadow-md" style={{ background: "linear-gradient(135deg, #015546 0%, #0A7A5A 100%)" }}>
            <Link href="/explore">
              Explore Active Projects Now <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
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
            <Link href="/explore" className="hover:text-foreground">Active Projects</Link>
            <Link href="/login" className="hover:text-foreground">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
