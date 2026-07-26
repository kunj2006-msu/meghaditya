import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Sun, MapPin, Calculator, ShieldCheck, ArrowRight, CloudRain, Zap } from 'lucide-react';
import PageBackground from '../components/PageBackground';
import Navbar from '../components/Navbar';
import homeBlend from '../assets/home-blend.png';

/**
 * LandingPage View
 * Rendered with homeBlend image background with Ken Burns motion (motion=true)
 */
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <PageBackground image={homeBlend} motion={true} overlayOpacity={0.32}>
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 flex flex-col justify-between">
        {/* Main Hero Glass Container */}
        <div className="my-auto max-w-4xl mx-auto w-full">
          <div className="glass-panel glass-blur rounded-3xl p-6 sm:p-10 md:p-14 shadow-2xl border border-white/25 text-center relative overflow-hidden backdrop-brightness-110">
            {/* Ambient subtle glow effects inside glass container */}
            <div className="absolute -top-24 -left-24 w-60 h-60 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-sky-300 text-xs font-semibold mb-6 shadow-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Official IMD Rainfall & ISRO Solar Irradiance Data</span>
            </div>

            {/* Wordmark Title */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-md mb-4">
              Meghaditya
            </h1>

            {/* Tagline */}
            <p className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-sky-200 via-white to-amber-200 bg-clip-text text-transparent mb-6 max-w-2xl mx-auto">
              Rooftop Resource Assessment Tool for India
            </p>

            {/* 1-2 sentence explainer */}
            <p className="text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed mb-8 sm:mb-10 max-w-3xl mx-auto font-medium">
              Accurately assesses rainwater harvesting potential and rooftop solar energy yield for any residential or commercial building across India, backed by verified district-level meteorological data.
            </p>

            {/* CTA Buttons: Side by side on desktop, stacked on mobile */}
            <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 max-w-md mx-auto">
              {/* Rainwater CTA */}
              <button
                type="button"
                onClick={() => navigate('/rainwater')}
                className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-base shadow-xl shadow-sky-600/30 border border-sky-400/40 transition-all hover:scale-[1.02] active:scale-95 group"
              >
                <Droplets className="w-5 h-5 text-sky-200" />
                <span>Rainwater Harvesting</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Solar CTA */}
              <button
                type="button"
                onClick={() => navigate('/solar')}
                className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-base shadow-xl shadow-amber-500/30 border border-amber-300/40 transition-all hover:scale-[1.02] active:scale-95 group"
              >
                <Sun className="w-5 h-5 text-slate-950" />
                <span>Solar Potential</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* 3-Step "How It Works" Glass Strip Below */}
        <div className="mt-12 max-w-5xl mx-auto w-full">
          <div className="glass-panel glass-blur rounded-2xl p-6 shadow-xl border border-white/20">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-300 text-center mb-6">
              How Meghaditya Works in 3 Simple Steps
            </h2>

            {/* Compact stacked on mobile, one row on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-900/40 border border-white/5">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 font-extrabold text-lg shrink-0 border border-sky-400/30">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-sky-400" />
                    Select Location
                  </h3>
                  <p className="text-xs text-slate-300 leading-normal">
                    Search over 700+ districts across all Indian states and Union Territories.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-900/40 border border-white/5">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 font-extrabold text-lg shrink-0 border border-teal-400/30">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-teal-400" />
                    Specify Roof Details
                  </h3>
                  <p className="text-xs text-slate-300 leading-normal">
                    Enter available rooftop surface area (m²) and roof material (RCC, tiled, or green).
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-900/40 border border-white/5">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-extrabold text-lg shrink-0 border border-amber-400/30">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Instant Report & Subsidies
                  </h3>
                  <p className="text-xs text-slate-300 leading-normal">
                    Get precise annual yield predictions, tank sizing, monthly charts, and state subsidies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Footer */}
        <footer className="mt-10 text-center text-xs text-slate-400">
          Meghaditya Assessment Tool • Powered by Open Meteorological Datasets & Government Policy Guidelines
        </footer>
      </main>
    </PageBackground>
  );
}
