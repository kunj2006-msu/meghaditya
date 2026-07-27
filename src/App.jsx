import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import LandingPage from './pages/LandingPage';
import RainwaterDashboard from './pages/RainwaterDashboard';
import SolarDashboard from './pages/SolarDashboard';

/**
 * Meghaditya Root Application Component
 * 
 * Architecture: SplashScreen and page routes are rendered EXCLUSIVELY — 
 * the app shows either the splash OR the routes, never both simultaneously.
 * This ensures LandingPage only mounts after the splash is fully complete,
 * so its entrance animation triggers naturally on mount without timing guesses.
 */
export default function App() {
  // Determine if splash needs to show at all this session
  const [showSplash] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
    return !sessionStorage.getItem('meghaditya_splash_shown');
  });

  // Tracks whether the splash sequence has completed
  const [splashDone, setSplashDone] = useState(!showSplash);

  const handleSplashComplete = useCallback(() => {
    setSplashDone(true);
  }, []);

  // Show splash exclusively — page routes are NOT mounted yet
  if (!splashDone) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Splash is done (or was skipped) — mount actual app routes
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/rainwater" element={<RainwaterDashboard />} />
        <Route path="/solar" element={<SolarDashboard />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}
