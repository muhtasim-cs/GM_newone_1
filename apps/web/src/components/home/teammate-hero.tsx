"use client";

import React, { useState, useEffect } from "react";
import { HERO_SLIDES } from "@/data/teammate-data";
import { MessageSquare, ArrowRight, Sparkles } from "lucide-react";

interface TeammateHeroProps {
  onJoinAsFarmer: () => void;
  onBecomeInvestor: () => void;
}

export function TeammateHero({ onJoinAsFarmer, onBecomeInvestor }: TeammateHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 2.0s continuous automatic slideshow crossfade
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[calc(100vh-72px)] min-h-[580px] max-h-[820px] overflow-hidden flex items-center justify-center">
      {/* Background Slideshow */}
      {HERO_SLIDES.map((slide, idx) => (
        <div
          key={slide.id || idx}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
          style={{
            backgroundImage: `url(${slide.image})`,
            backgroundPosition: "center 35%",
          }}
          aria-hidden={idx !== currentSlide}
        >
          {/* Subtle natural lighting vignette - lets authentic photography shine without watery blur */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#051A13]/40 via-[#051A13]/25 to-[#051A13]/55" />
        </div>
      ))}

      {/* Slide Meta Tag Indicator */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 hidden sm:flex items-center gap-2 bg-[#061D15]/80 backdrop-blur-md border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-300 shadow-lg">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span>{HERO_SLIDES[currentSlide]?.caption || "Authentic Bangladeshi Agriculture"}</span>
        <span className="text-emerald-400/50">•</span>
        <span className="text-white/80">{HERO_SLIDES[currentSlide]?.tag || "100% Halal & Asset-Backed"}</span>
      </div>

      {/* Pure High-Contrast Direct Text Overlay (No frosted/watery card box) */}
      <div className="relative z-10 max-w-4xl text-center px-6 py-12 mx-auto">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.15] tracking-tight mb-5 drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
          Empowering Rural Growth
          <br />
          Through Ethical Investment
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white/95 max-w-2xl mx-auto mb-8 font-medium leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
          Connecting conscious ethical investors with local farmers and rural women artisans to build a sustainable, interest-free future.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 sm:gap-5 flex-wrap">
          <button
            onClick={onJoinAsFarmer}
            type="button"
            className="bg-[#0E392B] hover:bg-[#154D3B] text-white text-base font-bold px-8 py-3.5 rounded-full border border-white/20 shadow-[0_6px_20px_rgba(0,0,0,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
          >
            Join as Farmer
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onBecomeInvestor}
            type="button"
            className="bg-[#D6CCA8] hover:bg-[#C8BFAB] text-[#14281E] text-base font-bold px-8 py-3.5 rounded-full border border-black/10 shadow-[0_6px_20px_rgba(0,0,0,0.3)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Become an Investor
          </button>
        </div>

        {/* Slide navigation dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {HERO_SLIDES.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => setCurrentSlide(dotIdx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                dotIdx === currentSlide
                  ? "w-8 bg-emerald-400"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${dotIdx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Floating Live Advisory Support Widget */}
      <button
        type="button"
        onClick={() => alert("GramBondhon Advisory: Investment & Producer support team is online.")}
        className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 w-12 h-12 rounded-xl bg-[#0E392B] hover:bg-[#154D3B] text-white flex items-center justify-center border border-emerald-500/30 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-transform hover:scale-110 active:scale-95 z-20 cursor-pointer"
        aria-label="Live Advisory Support"
        title="Live Advisory Support"
      >
        <MessageSquare className="w-5 h-5 text-emerald-300" />
      </button>
    </section>
  );
}
