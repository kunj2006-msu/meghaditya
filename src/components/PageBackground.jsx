import React from 'react';

/**
 * PageBackground Component
 * 
 * CRITICAL ARCHITECTURE REQUIREMENT:
 * - Uses a fixed viewport layer (`position: fixed, inset-0, -z-10`) completely decoupled from content scroll.
 * - DOES NOT use `background-attachment: fixed` which is broken on iOS Safari.
 * - Renders page content in a separate relative z-10 scrollable container.
 * - Supports smooth Ken Burns zoom animation for landing page (`motion=true`) while keeping dashboard backgrounds static (`motion=false`).
 */
export default function PageBackground({
  image,
  motion = false,
  overlayOpacity = 0.30,
  children
}) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* 1. Decoupled Fixed Full-Viewport Background Layer (-z-10) */}
      <div 
        aria-hidden="true"
        className="fixed inset-0 -z-10 h-full w-full overflow-hidden pointer-events-none select-none bg-slate-950"
      >
        {/* Background Image Element */}
        <img
          src={image}
          alt=""
          loading="eager"
          decoding="async"
          className={`h-full w-full object-cover object-center transition-opacity duration-700 ease-in-out ${
            motion ? 'animate-kenburns scale-100 origin-center' : 'scale-100'
          }`}
        />
        
        {/* Dark Tint Overlay with Tunable Opacity for Glass Contrast */}
        <div 
          className="absolute inset-0 bg-slate-950 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: overlayOpacity }}
        />

        {/* Subtle Vignette Gradient for Depth */}
        <div 
          className="absolute inset-0 bg-radial-vignette opacity-60 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, transparent 30%, rgba(2, 6, 23, 0.65) 100%)'
          }}
        />
      </div>

      {/* 2. Scrollable Page Content Container (z-10) */}
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        {children}
      </div>
    </div>
  );
}
