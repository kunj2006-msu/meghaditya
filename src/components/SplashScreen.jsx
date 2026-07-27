import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import api from '../api';

/**
 * SplashScreen Component
 * 
 * Renders a full-viewport splash overlay once per browser session.
 * - Uses sessionStorage ('meghaditya_splash_shown') to prevent re-display on route changes.
 * - Fires an early background warm-up ping GET /health once per session ('meghaditya_backend_pinged').
 * - Displays animated logo entrance, gradient shimmer wordmark, and progress bar.
 * - Automatically fades out after ~2.8s to reveal the landing page.
 * - Fully respects 'prefers-reduced-motion' OS setting by skipping scale/shimmer effects.
 */
export default function SplashScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(() => {
    // Check if splash has already been shown in this browser session
    const hasBeenShown = sessionStorage.getItem('meghaditya_splash_shown');
    return !hasBeenShown;
  });

  const [isFadingOut, setIsFadingOut] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Early fire-and-forget backend warm-up ping on initial mount
  useEffect(() => {
    if (!sessionStorage.getItem('meghaditya_backend_pinged')) {
      sessionStorage.setItem('meghaditya_backend_pinged', 'true');
      api.get('/health').catch(() => {
        // Silently ignore any warm-up ping failures
      });
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Detect user OS reduced motion setting
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    // Total active display time before fade out begins (4s total)
    const activeDuration = mediaQuery.matches ? 1500 : 3600;
    const fadeOutDuration = 400;

    // 1. Trigger fade-out transition
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, activeDuration);

    // 2. Unmount splash component & mark session storage
    const removeTimer = setTimeout(() => {
      sessionStorage.setItem('meghaditya_splash_shown', 'true');
      setIsVisible(false);
      if (onComplete) onComplete();
    }, activeDuration + fadeOutDuration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [isVisible, onComplete]);

  // Don't render anything if already shown in this session
  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#111927] to-[#1a0f08] text-white transition-opacity duration-400 ease-in-out pointer-events-auto select-none ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
      aria-label="Loading Meghaditya"
      role="dialog"
      aria-modal="true"
    >
      {/* Subtle background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Centered Content Stack */}
      <div className="relative z-10 flex flex-col items-center px-4 max-w-sm w-full text-center">
        {/* 1. Logo Image (Scaled & Faded) */}
        <div className={`mb-6 p-2 rounded-3xl bg-slate-900/40 border border-white/10 shadow-2xl backdrop-blur-md ${
          reducedMotion ? 'opacity-100 scale-100' : 'animate-logo-entrance'
        }`}>
          <img
            src={logo}
            alt="Meghaditya Logo"
            className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 object-contain drop-shadow-2xl"
            loading="eager"
          />
        </div>

        {/* 2. Shimmer Wordmark */}
        <h1
          className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-[#0ea5e9] via-[#38bdf8] via-[#fbbf24] to-[#f97316] bg-clip-text text-transparent ${
            reducedMotion ? '' : 'animate-text-shimmer'
          }`}
        >
          Meghaditya
        </h1>

        {/* 3. Medium-Width Progress Bar Indicator */}
        <div className="w-64 sm:w-80 max-w-sm h-3 sm:h-3.5 bg-slate-950/90 rounded-full overflow-hidden border border-white/20 shadow-lg shadow-sky-950/50 p-0.5 mt-2">
          <div
            className={`h-full rounded-full bg-gradient-to-r from-[#0ea5e9] via-[#38bdf8] via-[#fbbf24] to-[#f97316] shadow-sm ${
              reducedMotion ? 'w-full' : 'animate-progress-fill'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
