"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sprout,
  ArrowRight,
  CheckCircle2,
  Star,
  Leaf,
  TrendingUp,
  ShieldCheck,
  Wallet,
  BarChart3,
  FileText,
  Users,
  Globe,
  Phone,
  Mail,
  Facebook,
  Youtube,
  Linkedin,
  Instagram,
  ChevronRight,
  Clock,
  Sparkles,
  ShoppingBag,
  Layers,
  ChevronDown,
  Blocks,
  Award,
} from "lucide-react";
import { TeammateHero } from "@/components/home/teammate-hero";
import { TeammateProjectCard, ProjectCardData } from "@/components/home/teammate-project-card";
import { BlockchainBanner } from "@/components/home/blockchain-banner";
import { InvestmentSimulatorModal } from "@/components/home/investment-simulator-modal";
import { FarmerPortalModal } from "@/components/home/farmer-portal-modal";
import { MarketplaceModal } from "@/components/home/marketplace-modal";
import { ACTIVE_PROJECTS } from "@/data/teammate-data";

export default function HomePage() {
  const [selectedProject, setSelectedProject] = useState<ProjectCardData | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isFarmerPortalOpen, setIsFarmerPortalOpen] = useState(false);
  const [farmerPortalTab, setFarmerPortalTab] = useState<"farmer" | "artisan">("farmer");
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [howItWorksTab, setHowItWorksTab] = useState<"investors" | "farmers">("investors");

  const openSimulator = (project: ProjectCardData) => {
    setSelectedProject(project);
    setIsSimulatorOpen(true);
  };

  const openFarmerPortal = (tab: "farmer" | "artisan" = "farmer") => {
    setFarmerPortalTab(tab);
    setIsFarmerPortalOpen(true);
  };

  const filteredProjects = ACTIVE_PROJECTS.filter((proj) => {
    if (selectedCategory === "all") return true;
    return proj.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  const displayedProjects = showAllProjects ? filteredProjects : filteredProjects.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F7F4EC] text-[#142820] font-sans antialiased selection:bg-emerald-200 selection:text-emerald-900">
      {/* 1. TOP ANNOUNCEMENT TICKER */}
      <div className="bg-[#061D15] text-emerald-300 py-2 px-4 text-xs font-semibold border-b border-emerald-500/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/30">
              LIVE HARVEST
            </span>
            <span className="truncate">
              🌾 Bogura & Jamalpur Red Chilli batch funded • 35% Direct Investor Profit Share distributed on-chain!
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 shrink-0 text-slate-300">
            <Link href="/blockchain" className="hover:text-white flex items-center gap-1">
              <Blocks className="w-3.5 h-3.5 text-emerald-400" />
              Base Sepolia Testnet
            </Link>
            <span>•</span>
            <span className="text-emerald-400">0% Riba (Halal Shariah)</span>
          </div>
        </div>
      </div>

      {/* 2. NAVBAR (GramBondhon Authentic Navigation) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#0D382A]/10 shadow-[0_2px_12px_rgba(10,44,34,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#0D382A] flex items-center justify-center text-white shadow-md group-hover:bg-[#154D3B] transition-colors">
              <Sprout className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-[#0A2C22] tracking-tight block leading-tight">
                Gram<span className="text-emerald-700">Bondhon</span>
              </span>
              <span className="text-[10px] text-slate-500 font-serif block -mt-0.5">
                গ্রামীণ বন্ধন • Ethical Agritech
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-[#5B6E66]">
            <Link href="/" className="text-[#0D382A] font-bold hover:text-emerald-700 transition-colors">
              Home
            </Link>
            <a href="#projects" className="hover:text-[#0D382A] transition-colors">
              Active Projects
            </a>
            <button
              onClick={() => setIsMarketplaceOpen(true)}
              className="hover:text-[#0D382A] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              Marketplace
            </button>
            <a href="#how-it-works" className="hover:text-[#0D382A] transition-colors">
              How It Works
            </a>
            <button
              onClick={() => openFarmerPortal("farmer")}
              className="text-[#0D382A] font-bold hover:text-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Users className="w-4 h-4 text-emerald-600" />
              Farmers & Women
            </button>
            <Link href="/blockchain" className="hover:text-[#0D382A] transition-colors flex items-center gap-1">
              <Blocks className="w-4 h-4 text-emerald-600" />
              Public Ledger
            </Link>
          </nav>

          {/* Action Buttons & Wallet Connection */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#0D382A] bg-[#EAE6DB] hover:bg-[#DDD8CA] px-3.5 py-2 rounded-full transition-all"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#0D382A]" />
              Dashboard
            </Link>

            {/* Connect Wallet / Public Ledger Link */}
            <Link
              href="/blockchain"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0D382A] hover:bg-[#154D3B] px-4 py-2 rounded-full shadow-sm transition-all"
            >
              <Blocks className="w-3.5 h-3.5 text-emerald-400" />
              <span>Connect Wallet</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION (Continuous 2.0s Slideshow with Authentic Photography) */}
      <TeammateHero
        onJoinAsFarmer={() => openFarmerPortal("farmer")}
        onBecomeInvestor={() => {
          const el = document.getElementById("projects");
          el?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* 4. BLOCKCHAIN TRUST BANNER (Base Sepolia On-Chain Ledger Proofs) */}
      <BlockchainBanner />

      {/* 5. ACTIVE PROJECTS SECTION */}
      <section id="projects" className="py-14 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-600/20 text-[#0A4E38] px-3 py-1 rounded-full text-xs font-bold mb-2.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Invest Now. Create Impact. Earn Returns !!</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2C22] tracking-tight">
              Active Projects (চলমান প্রকল্পসমূহ)
            </h2>
            <p className="text-base text-slate-600 mt-1 max-w-xl">
              Ethical agricultural and village handicraft investments backed by verified ground audits and Mudarabah profit sharing.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowAllProjects(!showAllProjects)}
              className="bg-[#0D382A] hover:bg-[#154D3B] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>{showAllProjects ? "Show Top 4 Projects" : "View All 16 Projects"}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showAllProjects ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {[
            { id: "all", label: "All Categories (সকল)" },
            { id: "crops", label: "🌾 Crops & Rice (ফসল ও ধান)" },
            { id: "livestock", label: "🐄 Livestock & Poultry (পোল্ট্রি ও পশু)" },
            { id: "handicrafts", label: "🧵 Handicrafts (হস্তশিল্প ও নকশী কাঁথা)" },
            { id: "fisheries", label: "🐟 Aquaculture (মাছ চাষ)" },
            { id: "agro", label: "🍯 Honey & Tea (চা ও মধু)" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs font-bold px-3.5 py-2 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-[#0A2C22] text-white shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 4-Card Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayedProjects.map((proj) => (
            <TeammateProjectCard
              key={proj.id}
              project={proj as unknown as ProjectCardData}
              onInvest={(p) => openSimulator(p)}
              onViewTerms={(p) => openSimulator(p)}
            />
          ))}
        </div>

        {/* Bottom Expand Toggle */}
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAllProjects(!showAllProjects)}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-[#0A2C22] border border-[#0D382A]/20 px-6 py-2.5 rounded-full text-sm font-bold shadow-sm transition-all cursor-pointer"
          >
            <span>{showAllProjects ? "Show Less" : "View All 16 Verified Projects (সবগুলো দেখুন)"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 6. VILLAGE MARKETPLACE SPOTLIGHT */}
      <section className="py-14 bg-[#EAE5D7]/60 border-y border-[#0D382A]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-[#0A2C22] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-400/30 mb-3">
                <ShoppingBag className="w-3.5 h-3.5" />
                Village Fair-Trade Marketplace
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
                Direct Village Bazaar (গ্রামীণ হাট)
              </h2>
              <p className="text-sm sm:text-base text-white/85 leading-relaxed mb-6">
                Support rural women artisans and family farmers directly. Purchase authentic Jamalpur Nakshi Kantha, Bogura cold-pressed mustard oil, Sundarbans wild honey, and export-grade organic mangoes.
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setIsMarketplaceOpen(true)}
                  className="bg-[#D6CCA8] hover:bg-[#C8BFAB] text-[#14281E] font-bold px-6 py-3 rounded-full text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#14281E]" />
                  <span>Open Village Marketplace (49 Products)</span>
                </button>
                <button
                  onClick={() => openFarmerPortal("artisan")}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 rounded-full text-sm border border-white/20 transition-all cursor-pointer"
                >
                  Join as Artisan Seller
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. DUAL-TRACK "HOW IT WORKS" */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
            Clear & Transparent Process
          </span>
          <h2 className="text-3xl font-extrabold text-[#0A2C22] tracking-tight mt-2">
            How GramBondhon Works
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Zero usury, asset-backed collaboration connecting conscious capital with verified rural production.
          </p>

          {/* Toggle Tabs */}
          <div className="inline-flex bg-white p-1 rounded-full border border-slate-200 shadow-sm mt-6">
            <button
              onClick={() => setHowItWorksTab("investors")}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                howItWorksTab === "investors"
                  ? "bg-[#0D382A] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              For Ethical Investors (বিনিয়োগকারীদের জন্য)
            </button>
            <button
              onClick={() => setHowItWorksTab("farmers")}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                howItWorksTab === "farmers"
                  ? "bg-[#0D382A] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              For Farmers & Village Women (কৃষক ও নারীদের জন্য)
            </button>
          </div>
        </div>

        {howItWorksTab === "investors" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold text-xl flex items-center justify-center mb-4">
                01
              </div>
              <h3 className="text-lg font-bold text-[#0A2C22] mb-1.5">Browse & Simulate</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Explore verified Bangladesh agricultural and craft clusters. Use the interactive simulator to review target harvest returns and Shariah terms.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold text-xl flex items-center justify-center mb-4">
                02
              </div>
              <h3 className="text-lg font-bold text-[#0A2C22] mb-1.5">Commit Capital & Log On-Chain</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Fund units seamlessly via bKash/Nagad or Base Sepolia Web3 wallet. Your partnership pledge is secured by an immutable blockchain record.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold text-xl flex items-center justify-center mb-4">
                03
              </div>
              <h3 className="text-lg font-bold text-[#0A2C22] mb-1.5">Harvest Payout & Profit Share</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Receive weekly field photo updates. Upon market sale, your direct profit share (e.g., 35% investor share) is deposited automatically.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold text-xl flex items-center justify-center mb-4">
                01
              </div>
              <h3 className="text-lg font-bold text-[#0A2C22] mb-1.5">Submit Producer Application</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Provide farm or craft details, NID, and input requirements. Zero compound interest or predatory collateral required.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold text-xl flex items-center justify-center mb-4">
                02
              </div>
              <h3 className="text-lg font-bold text-[#0A2C22] mb-1.5">On-Site Agronomist Verification</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Our local field officers visit your land or workshop to verify soil, seed/chick quality, and establish guaranteed wholesale off-take contracts.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold text-xl flex items-center justify-center mb-4">
                03
              </div>
              <h3 className="text-lg font-bold text-[#0A2C22] mb-1.5">Working Capital Disbursement</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Funds are disbursed directly to your bKash or bank. Grow with dignity, retaining the major share (65–70%) of net harvest earnings.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* 8. IMPACT STATS & SHARIAH COMPLIANCE */}
      <section className="py-14 bg-[#0A2C22] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">৳4.2 কোটি+</div>
              <div className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">BDT Capital Mobilized</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">1,800+</div>
              <div className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">Verified Rural Producers</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">৳85 লক্ষ+</div>
              <div className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">Halal Returns Distributed</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">12,480+</div>
              <div className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">On-Chain Proofs Logged</div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-[#061D15] text-slate-400 py-12 border-t border-emerald-500/20 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-extrabold text-base mb-3">
              <Sprout className="w-5 h-5 text-emerald-400" />
              <span>GramBondhon</span>
            </div>
            <p className="text-slate-400 leading-relaxed mb-4">
              Bangladesh’s ethical agritech platform pioneering interest-free agricultural growth and transparent blockchain accountability.
            </p>
            <div className="text-emerald-400 font-semibold">
              Shariah Compliant • 100% Asset-Backed
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3">Platform Navigation</h4>
            <ul className="space-y-2">
              <li>
                <a href="#projects" className="hover:text-white">Active Projects</a>
              </li>
              <li>
                <button onClick={() => setIsMarketplaceOpen(true)} className="hover:text-white cursor-pointer">
                  Village Marketplace
                </button>
              </li>
              <li>
                <button onClick={() => openFarmerPortal("farmer")} className="hover:text-white cursor-pointer">
                  Farmers & Women Portal
                </button>
              </li>
              <li>
                <Link href="/blockchain" className="hover:text-white">
                  Base Sepolia Ledger
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3">Audits & Compliance</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/audit" className="hover:text-white">Third-Party Field Audits</Link>
              </li>
              <li>
                <Link href="/documents" className="hover:text-white">Mudarabah Partnership Deeds</Link>
              </li>
              <li>
                <a href="https://sepolia.basescan.org" target="_blank" rel="noreferrer" className="hover:text-white">
                  BaseScan Smart Contract
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3">Field Hubs</h4>
            <p className="text-slate-400 leading-relaxed mb-2">
              Dhaka HQ • Sariakandi (Bogura) • Jamalpur Craft Guild • Sreemangal Tea Office
            </p>
            <p className="text-slate-400">
              Helpline: +880 1711-000000<br />
              Email: salam@grambondhon.org
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 mt-8 border-t border-slate-800 text-center text-slate-500 text-[11px]">
          &copy; {new Date().getFullYear()} GramBondhon Platform (গ্রামীণ বন্ধন). All rights reserved. Built with Next.js, Wagmi & Base Sepolia.
        </div>
      </footer>

      {/* 10. INTERACTIVE MODALS */}
      <InvestmentSimulatorModal
        project={selectedProject}
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />

      <FarmerPortalModal
        isOpen={isFarmerPortalOpen}
        onClose={() => setIsFarmerPortalOpen(false)}
        initialTab={farmerPortalTab}
      />

      <MarketplaceModal
        isOpen={isMarketplaceOpen}
        onClose={() => setIsMarketplaceOpen(false)}
      />
    </div>
  );
}