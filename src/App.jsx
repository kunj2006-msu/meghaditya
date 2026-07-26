import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import LandingPage from './pages/LandingPage';
import RainwaterDashboard from './pages/RainwaterDashboard';
import SolarDashboard from './pages/SolarDashboard';

/**
 * Meghaditya Root Application Component
 * Renders the one-time SplashScreen overlay and client-side routes.
 */
export default function App() {
  return (
    <>
      {/* One-time session splash overlay */}
      <SplashScreen />

      {/* Main Router Views */}
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/rainwater" element={<RainwaterDashboard />} />
          <Route path="/solar" element={<SolarDashboard />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Router>
    </>
  );
}
