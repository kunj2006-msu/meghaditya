import React from 'react';

/**
 * PageBackground Component
 * 
 * CRITICAL ARCHITECTURE REQUIREMENT:
 * - Uses a fixed viewport layer (`position: fixed, inset-0, -z-10`) completely decoupled from content scroll.
 * - DOES NOT use `background-attachment: fixed` which is broken on iOS Safari.
 * - Renders page content in a separate relative z-10 scrollable container.
 * - Supports smooth Ken Burns zoom animation for landing page (`motion=true`) while keeping dashboard backgrounds static (`motion=false`).
 * - Supports optional entrance animation via `animateEntrance` prop with configurable delay/duration.
 */
export default function PageBackground({
  image,
  motion = false,
  overlayOpacity = 0.30,
  animateEntrance = false,
  entranceDelay = '0s',
  entranceDuration = '1s',
  children
}) {
  // Build className and inline style for the background image.
  // When animateEntrance is true, the animation is set via inline style
  // (not CSS class) to avoid var()-in-animation-shorthand browser bug.
  const EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';

  const imgBaseClass = `h-full w-full object-cover object-center ${
    motion && !animateEntrance ? 'animate-kenburns scale-100 origin-center' : 'scale-100'
  }`;

  // Build inline animation: bgReveal entrance, optionally chained with kenburns
  let imgClass = imgBaseClass;
  let imgStyle = undefined;

  if (animateEntrance) {
    imgClass = `${imgBaseClass} anim-bg-reveal`;
    const entranceAnim = `bgReveal ${entranceDuration} ${EASING} ${entranceDelay} both`;
    if (motion) {
      // Chain: entrance reveal first, then Ken Burns continues after
      imgStyle = { animation: `${entranceAnim}, kenburns 20s ease-in-out ${entranceDuration} infinite alternate` };
    } else {
      imgStyle = { animation: entranceAnim };
    }
  }

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
          className={imgClass}
          style={imgStyle}
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
