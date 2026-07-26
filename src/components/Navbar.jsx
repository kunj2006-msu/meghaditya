import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Droplets, Sun, Home, Compass } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/60 border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo / Wordmark */}
        <Link 
          to="/" 
          className="flex items-center gap-2.5 group transition-transform active:scale-95"
        >
          <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500 via-teal-500 to-amber-500 shadow-md group-hover:shadow-sky-500/20 transition-all">
            <Compass className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-sky-100 to-amber-200 bg-clip-text text-transparent drop-shadow-sm">
              Meghaditya
            </span>
            <span className="hidden sm:inline-block text-[10px] text-sky-400 font-bold uppercase tracking-wider ml-2 px-1.5 py-0.5 rounded bg-sky-950/80 border border-sky-800">
              India Rooftop Assessment
            </span>
          </div>
        </Link>

        {/* Navigation Buttons */}
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              path === '/' 
                ? 'bg-white/20 text-white border border-white/30 shadow' 
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Home</span>
          </Link>

          <Link
            to="/rainwater"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              path === '/rainwater'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30 border border-sky-400/50'
                : 'bg-sky-950/70 text-sky-200 hover:bg-sky-900 border border-sky-800/60'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-sky-300" />
            <span>Rainwater</span>
          </Link>

          <Link
            to="/solar"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              path === '/solar'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 border border-amber-300/50'
                : 'bg-amber-950/70 text-amber-200 hover:bg-amber-900 border border-amber-800/60'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-300" />
            <span>Solar</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
