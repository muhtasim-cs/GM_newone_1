"use client";

import React from "react";
import Image from "next/image";
import { ShieldCheck, MapPin } from "lucide-react";

export interface ProjectCardData {
  id: string;
  name: string;
  bengaliName?: string;
  location?: string;
  district?: string;
  image: string;
  badge?: string;
  pricePerShareBDT?: number;
  minInvestmentBDT?: number;
  profitReturn?: string;
  potentialReturn?: string;
  periodText?: string;
  totalReturnBDT?: string;
  returnTypeTag?: string;
  bengaliReturn?: string;
  profitRatio?: string;
  investorShareText?: string;
  bengaliProfitSplit?: string;
  fundedPercent?: number;
  fundingRaisedBDT?: number;
  fundingGoalBDT?: number;
  durationOrRaised?: string;
  duration?: string;
  raisedBDT?: number;
  goalBDT?: number;
}

interface TeammateProjectCardProps {
  project: ProjectCardData;
  onInvest: (project: ProjectCardData) => void;
  onViewTerms: (project: ProjectCardData) => void;
}

export function TeammateProjectCard({ project, onInvest, onViewTerms }: TeammateProjectCardProps) {
  const price = project.pricePerShareBDT || project.minInvestmentBDT || 10000;
  const returnRate = project.profitReturn || project.potentialReturn || "15.5% – 18.2%";
  const fundedPct =
    project.fundedPercent ??
    (project.fundingRaisedBDT && project.fundingGoalBDT
      ? Math.round((project.fundingRaisedBDT / project.fundingGoalBDT) * 100)
      : 75);
  const raised = project.raisedBDT || project.fundingRaisedBDT || 480000;
  const goal = project.goalBDT || project.fundingGoalBDT || 800000;
  const duration = project.durationOrRaised || project.duration || "24 Days Left";
  const locationText = project.location || project.district || "Bangladesh";

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#0D382A]/10 flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_30px_rgba(10,44,34,0.12)] transition-all duration-300 group">
      {/* Image Header with Bottom Info Overlay */}
      <div className="relative h-56 bg-[#061D15] overflow-hidden">
        <img
          src={project.image}
          alt={project.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#061D15]/20 to-[#061D15]/95 pointer-events-none" />

        {/* Top Badges: LIVE & Verified */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex justify-between items-center z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 bg-[#061D15]/85 backdrop-blur-md text-emerald-400 px-2.5 py-1 rounded-full text-[11px] font-extrabold border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
          <span className="bg-white/95 backdrop-blur-sm text-[#0D382A] px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Verified
          </span>
        </div>

        {/* Bottom Text Over Image */}
        <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-4 flex justify-between items-end gap-3 z-10 text-white">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight truncate drop-shadow-sm">
              {project.name}
            </h3>
            {project.bengaliName && (
              <p className="text-xs text-white/80 font-medium truncate mt-0.5 font-serif">
                {project.bengaliName}
              </p>
            )}
            <div className="text-xs text-white/90 font-medium truncate flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{locationText}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-none">
              ৳ {price.toLocaleString()}
            </div>
            <div className="text-[11px] text-white/80 font-medium mt-0.5">BDT / unit</div>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow bg-white">
        {/* Top Tag */}
        <div className="flex justify-end mb-3">
          <span className="inline-flex items-center gap-1 bg-[#D7F2D0] text-[#16532B] px-3 py-1 rounded-full text-xs font-bold">
            🌱 {project.returnTypeTag || "Variable Return"}
          </span>
        </div>

        {/* Key Metrics */}
        <div className="flex flex-col gap-2.5 mb-4 pb-3.5 border-b border-[#0D382A]/10">
          <div className="flex justify-between items-baseline text-sm">
            <span className="text-slate-500 font-medium">Period</span>
            <strong className="text-[#084E43] font-bold">{project.periodText || "4 Months"}</strong>
          </div>
          <div className="flex justify-between items-baseline text-sm">
            <span className="text-slate-500 font-medium">Est. Return</span>
            <strong className="text-[#084E43] font-extrabold text-base">{returnRate}</strong>
          </div>
          {project.investorShareText && (
            <div className="bg-[#061D15] text-emerald-300 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-emerald-500/20 text-center">
              {project.investorShareText}
            </div>
          )}
          <div className="flex justify-between items-baseline text-sm pt-1">
            <span className="text-slate-500 font-medium">Total Return</span>
            <strong className="text-[#061D15] font-extrabold">{project.totalReturnBDT || "Variable"}</strong>
          </div>
        </div>

        {/* Funding Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-baseline text-xs mb-1.5">
            <strong className="text-[#084E43] font-bold">{fundedPct}% Funded</strong>
            <span className="text-slate-500 font-semibold">{duration}</span>
          </div>
          <div className="h-2 bg-[#EAE6DB] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full transition-all duration-700"
              style={{ width: `${Math.min(fundedPct, 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5 font-medium">
            Raised: ৳{raised.toLocaleString()} of ৳{goal.toLocaleString()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-auto pt-1">
          <button
            onClick={() => onInvest(project)}
            type="button"
            className="bg-[#0D382A] hover:bg-[#154D3B] text-white text-xs sm:text-sm font-bold py-2.5 px-3 rounded-full shadow-[0_2px_8px_rgba(13,56,42,0.2)] transition-all cursor-pointer text-center"
          >
            Invest Now
          </button>
          <button
            onClick={() => onViewTerms(project)}
            type="button"
            className="bg-[#EFEBE0] hover:bg-[#E2DDD0] text-[#0D382A] text-xs sm:text-sm font-bold py-2.5 px-3 rounded-full border border-[#0D382A]/15 transition-all cursor-pointer text-center"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
