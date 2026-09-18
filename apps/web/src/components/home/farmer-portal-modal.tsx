"use client";

import React, { useState } from "react";
import { X, Sprout, Scissors, CheckCircle2, ShieldCheck, MapPin, Smartphone, ArrowRight, UserCheck } from "lucide-react";

interface FarmerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "farmer" | "artisan";
}

export function FarmerPortalModal({ isOpen, onClose, initialTab = "farmer" }: FarmerPortalModalProps) {
  const [activeTab, setActiveTab] = useState<"farmer" | "artisan">(initialTab);
  const [demoActive, setDemoActive] = useState<"farmer" | "artisan" | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#0D382A]/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0A2C22] p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="inline-block bg-emerald-400/20 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30 mb-2">
            🌱 Producer Empowerment Portal
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold">
            Farmer & Rural Women Portal (কৃষক ও গ্রামীণ নারী পোর্টাল)
          </h2>
          <p className="text-xs sm:text-sm text-white/80 mt-1">
            Apply for zero-interest working capital or showcase village crafts with zero predatory middlemen.
          </p>

          {/* Role Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                setActiveTab("farmer");
                setDemoActive(null);
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "farmer"
                  ? "bg-white text-[#0A2C22] shadow-sm"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              <Sprout className="w-4 h-4 text-emerald-600" />
              Crop & Livestock Farmer
            </button>
            <button
              onClick={() => {
                setActiveTab("artisan");
                setDemoActive(null);
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "artisan"
                  ? "bg-white text-[#0A2C22] shadow-sm"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              <Scissors className="w-4 h-4 text-emerald-600" />
              Rural Woman Artisan
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[70vh] overflow-y-auto">
          {/* Quick Demo Evaluation Buttons */}
          <div className="bg-[#F7F4EC] rounded-xl p-4 border border-[#0D382A]/15 mb-5">
            <div className="text-xs font-bold text-[#0A2C22] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              One-Click Teacher / Evaluator Demo:
            </div>
            {activeTab === "farmer" ? (
              <button
                type="button"
                onClick={() => setDemoActive("farmer")}
                className="w-full bg-[#0D382A] hover:bg-[#154D3B] text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all text-left flex items-center justify-between cursor-pointer"
              >
                <span>⚡ Demo as Md. Rafiqul Islam (Gazipur Sustainable Poultry)</span>
                <span className="text-emerald-300 font-normal text-xs">Load Profile →</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setDemoActive("artisan")}
                className="w-full bg-[#0D382A] hover:bg-[#154D3B] text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all text-left flex items-center justify-between cursor-pointer"
              >
                <span>⚡ Demo as Fatima Begum (Jamalpur Nakshi Kantha Collective)</span>
                <span className="text-emerald-300 font-normal text-xs">Load Profile →</span>
              </button>
            )}
          </div>

          {/* Active Demo Profile Card */}
          {demoActive && (
            <div className="bg-white rounded-xl p-4 border-2 border-emerald-600/50 shadow-md mb-5 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-800 text-sm">
                    {demoActive === "farmer" ? "RI" : "FB"}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {demoActive === "farmer" ? "Md. Rafiqul Islam" : "Fatima Begum"}
                    </h4>
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> NID Verified Producer
                    </span>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-900 text-[11px] font-extrabold px-2.5 py-1 rounded-full">
                  Status: ACTIVE PRODUCER
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg">
                  <span className="text-slate-500 block text-[10px]">Location</span>
                  <strong className="text-slate-800">
                    {demoActive === "farmer" ? "Gazipur, Dhaka" : "Jamalpur, Mymensingh"}
                  </strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg">
                  <span className="text-slate-500 block text-[10px]">Capital Disbursed</span>
                  <strong className="text-emerald-700">৳ 4,80,000 BDT</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block text-[10px]">Payout Wallet</span>
                  <strong className="text-slate-800 font-mono">bKash (017...82)</strong>
                </div>
              </div>
            </div>
          )}

          {/* New Application Form Preview */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">Submit New Producer Project</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">Full Name / খামারির নাম</label>
                <input
                  type="text"
                  placeholder="e.g. মো: রফিকুল ইসলাম"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600 outline-none"
                  readOnly
                  value={demoActive === "farmer" ? "Md. Rafiqul Islam" : demoActive === "artisan" ? "Fatima Begum" : ""}
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-semibold">National ID (NID) Number</label>
                <input
                  type="text"
                  placeholder="10 or 17 digit NID"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600 outline-none"
                  readOnly
                  value={demoActive ? "19842691238900412" : ""}
                />
              </div>
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-semibold">Project Description & Needs</label>
              <textarea
                rows={2}
                placeholder="Describe your harvest timeline, feed/seed requirements, and expected production..."
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-600 outline-none"
                readOnly
                value={
                  demoActive === "farmer"
                    ? "Sustainable poultry cluster: 3,000 broiler batch requiring working capital for organic feed and climate-controlled sheds under Mudarabah profit sharing."
                    : demoActive === "artisan"
                    ? "Nakshi Kantha embroidery collective: 12 village artisans needing silk threads and pure cotton fabrics for export-grade bedding."
                    : ""
                }
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center gap-3 pt-5 mt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                alert("Application submitted for in-person agronomist inspection.");
                onClose();
              }}
              className="flex-1 bg-[#0D382A] hover:bg-[#154D3B] text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all cursor-pointer text-center"
            >
              Submit Application for Verification
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-sm transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
