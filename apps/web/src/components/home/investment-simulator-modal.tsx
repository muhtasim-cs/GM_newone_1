"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Calculator, ShieldCheck, Sparkles, AlertCircle, ArrowRight, Blocks } from "lucide-react";
import { ProjectCardData } from "./teammate-project-card";

interface InvestmentSimulatorModalProps {
  project: ProjectCardData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InvestmentSimulatorModal({ project, isOpen, onClose }: InvestmentSimulatorModalProps) {
  const [investmentBDT, setInvestmentBDT] = useState<number>(20000);

  if (!isOpen || !project) return null;

  // Extract min and max percentages from "15.5% – 18.2%"
  const rateStr = project.profitReturn || project.potentialReturn || "15.5% – 18.2%";
  const match = rateStr.match(/([\d.]+)%?\s*–\s*([\d.]+)%/);
  const minRate = match ? parseFloat(match[1]) / 100 : 0.15;
  const maxRate = match ? parseFloat(match[2]) / 100 : 0.18;

  const minProfit = Math.round(investmentBDT * minRate);
  const maxProfit = Math.round(investmentBDT * maxRate);
  const minTotal = investmentBDT + minProfit;
  const maxTotal = investmentBDT + maxProfit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#0D382A]/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Project Banner */}
        <div className="relative h-36 bg-[#061D15] overflow-hidden">
          <img
            src={project.image}
            alt={project.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#061D15] via-[#061D15]/60 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black/80 flex items-center justify-center transition-colors cursor-pointer z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Project titles */}
          <div className="absolute bottom-3.5 left-5 right-5 text-white">
            <span className="inline-block bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 mb-1">
              🌾 Investment Simulation & Terms
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold truncate">{project.name}</h2>
            <p className="text-xs text-white/80">{project.location}</p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          {/* Simulator Box */}
          <div className="bg-[#F7F4EC] rounded-xl p-4 sm:p-5 border border-[#0D382A]/10 mb-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-[#0A2C22] flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-700" />
                Select Investment Amount (বিনিয়োগের পরিমাণ)
              </label>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Mudarabah Halal Profit Sharing
              </span>
            </div>

            {/* Input & Quick Buttons */}
            <div className="mb-4">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-[#0A2C22]">
                  ৳
                </span>
                <input
                  type="number"
                  step="1000"
                  min="5000"
                  max="1000000"
                  value={investmentBDT}
                  onChange={(e) => setInvestmentBDT(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full pl-9 pr-4 py-3 bg-white border border-[#0D382A]/20 rounded-xl font-mono text-xl font-bold text-[#0A2C22] focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-2 mt-2.5">
                {[10000, 20000, 50000, 100000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setInvestmentBDT(preset)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      investmentBDT === preset
                        ? "bg-[#0D382A] text-white border-[#0D382A]"
                        : "bg-white text-[#0A2C22] border-slate-300 hover:border-emerald-600"
                    }`}
                  >
                    ৳ {preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Return Calculation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#0D382A]/10">
              <div className="bg-white rounded-lg p-3.5 border border-[#0D382A]/10">
                <div className="text-xs text-slate-500 font-medium">Estimated Net Profit</div>
                <div className="text-lg font-extrabold text-emerald-700 font-mono mt-0.5">
                  ৳ {minProfit.toLocaleString()} – ৳ {maxProfit.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">At {project.profitReturn} return rate</div>
              </div>

              <div className="bg-[#061D15] rounded-lg p-3.5 text-white border border-emerald-500/20">
                <div className="text-xs text-emerald-300 font-medium">Total Projected Payout</div>
                <div className="text-lg font-extrabold text-white font-mono mt-0.5">
                  ৳ {minTotal.toLocaleString()} – ৳ {maxTotal.toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-400 mt-0.5">Capital + Profit at Harvest</div>
              </div>
            </div>
          </div>

          {/* Shariah & Blockchain Verification Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-5">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-900 block">100% Shariah Compliant</strong>
                <span className="text-emerald-800 text-[11px]">
                  Governed by authentic Mudarabah profit-sharing ratios with zero predatory interest.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <Blocks className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block">Base Sepolia On-Chain Ledger</strong>
                <span className="text-slate-600 text-[11px]">
                  All commitments recorded immutably on Base testnet smart contract.
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Link
              href={`/deals`}
              onClick={onClose}
              className="flex-1 bg-[#0D382A] hover:bg-[#154D3B] text-white text-center font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
            >
              <span>Proceed to Formal Deal Allocation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-5 rounded-xl transition-all text-sm cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
