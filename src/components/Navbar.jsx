import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Droplets, Sun, Home, Compass, Menu, X, ArrowRight } from 'lucide-react';

/**
 * Navbar Component
 * 
 * Features:
 * - Responsive 3-line hamburger navigation bar for mobile / small screen ratios.
 * - Desktop inline navigation bar for medium/large viewports.
 * - Preserves frosted glassmorphic styling system (backdrop-blur, slate-950 tint, white/10 borders).
 * - Auto-closes mobile menu on route changes.
 */
export default function Navbar() {
  const location = useLocation();
  const path = location.pathname;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-close mobile menu when navigating to a new route
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [path]);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/70 border-b border-white/10 shadow-lg">
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

        {/* Desktop Navigation Links (hidden on mobile, visible on sm and up) */}
        <nav className="hidden sm:flex items-center gap-2 md:gap-3">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              path === '/' 
                ? 'bg-white/20 text-white border border-white/30 shadow' 
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
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

        {/* Mobile 3-Line Hamburger Button (visible on screens smaller than sm) */}
        <div className="flex sm:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex items-center justify-center p-2 rounded-xl text-slate-200 hover:text-white bg-slate-900/80 border border-white/15 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-md transition-all active:scale-95"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-rose-400" />
            ) : (
              <Menu className="w-5 h-5 text-sky-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Glassmorphic Dropdown Drawer (sm:hidden) */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-xl animate-fadeIn">
          <div className="px-4 py-4 space-y-2.5 max-w-7xl mx-auto">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                path === '/'
                  ? 'bg-white/15 text-white border border-white/25 shadow-md'
                  : 'text-slate-200 hover:bg-white/10 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Home className="w-4 h-4 text-sky-400" />
                <span>Home Page</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/rainwater"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                path === '/rainwater'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30 border border-sky-400/50'
                  : 'bg-sky-950/60 text-sky-200 border border-sky-800/50 hover:bg-sky-900/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Droplets className="w-4 h-4 text-sky-300" />
                <span>Rainwater Harvesting</span>
              </div>
              <ArrowRight className="w-4 h-4 text-sky-300/70" />
            </Link>

            <Link
              to="/solar"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                path === '/solar'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 border border-amber-300/50'
                  : 'bg-amber-950/60 text-amber-200 border border-amber-800/50 hover:bg-amber-900/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Solar Potential</span>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-300/70" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
