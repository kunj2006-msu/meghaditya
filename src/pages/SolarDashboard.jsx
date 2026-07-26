import React, { useState, useEffect } from 'react';
import { Sun, ArrowLeft, Loader2, Sparkles, AlertCircle, Calendar, BarChart3, Zap, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageBackground from '../components/PageBackground';
import Navbar from '../components/Navbar';
import LocationSearch from '../components/LocationSearch';
import ResultCard from '../components/ResultCard';
import SubsidyPanel from '../components/SubsidyPanel';
import solarScene from '../assets/solar-scene.png';
import { API_BASE_URL } from '../config';

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * SolarDashboard View
 * Rendered with solarScene image background static (motion=false)
 */
export default function SolarDashboard() {
  const navigate = useNavigate();

  // Form State
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [roofArea, setRoofArea] = useState('120');

  // Async API states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Monthly Solar Data state
  const [monthlyData, setMonthlyData] = useState(null);
  const [isMonthlyLoading, setIsMonthlyLoading] = useState(false);

  // Submit Solar Assessment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLocation) {
      setErrorMessage('Please select a district location from the search bar.');
      return;
    }

    const areaNum = parseFloat(roofArea);
    if (isNaN(areaNum) || areaNum <= 0) {
      setErrorMessage('Please enter a valid positive rooftop area (m²).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Post Solar Assessment Request
      const payload = {
        location_id: selectedLocation.location_id,
        roof_area_m2: areaNum,
      };

      const response = await fetch(`${API_BASE_URL}/assess/solar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Assessment failed (${response.status})`);
      }

      const data = await response.json();
      setAssessmentResult(data);

      // 2. Fetch 12-Month Solar Breakdown
      fetchMonthlyData(selectedLocation.location_id);
    } catch (err) {
      console.error('Solar assessment error:', err);
      setErrorMessage(err.message || 'Failed to complete solar assessment. Check backend API connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchMonthlyData = async (locId) => {
    setIsMonthlyLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/locations/${locId}/solar-monthly`);
      if (res.ok) {
        const mData = await res.json();
        setMonthlyData(mData);
      }
    } catch (err) {
      console.error('Failed to fetch monthly solar irradiance:', err);
    } finally {
      setIsMonthlyLoading(false);
    }
  };

  // Find max irradiance for scaling bar chart
  const maxIrr = monthlyData?.monthly_data
    ? Math.max(...monthlyData.monthly_data.map(d => d.irradiance_kwh_m2_day), 6.5)
    : 7.0;

  return (
    <PageBackground image={solarScene} motion={false} overlayOpacity={0.35}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-white mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-3">
              <Sun className="w-8 h-8 text-amber-400" />
              <span>Rooftop Solar Energy Potential</span>
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Estimate rooftop PV system capacity (kWp) and monthly energy yield based on NIWE solar radiation maps.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => navigate('/rainwater')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-300 hover:bg-sky-500/30 text-xs font-bold transition-all shadow-md"
            >
              <span>Switch to Rainwater Assessment</span>
              <Sparkles className="w-4 h-4 text-sky-400" />
            </button>
          </div>
        </div>

        {/* Responsive Grid: Mobile single column, Tablet/Desktop Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (5 Cols): Form Input Panel */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="glass-panel glass-blur rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20">
              <h2 className="text-lg font-bold text-white mb-1">Solar Inputs</h2>
              <p className="text-xs text-slate-300 mb-6">Enter available unshaded rooftop area to model solar array output.</p>

              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-3 shadow-md">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Error</strong>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 1. Location Autocomplete */}
                <LocationSearch
                  selectedLocation={selectedLocation}
                  onSelectLocation={(loc) => {
                    setSelectedLocation(loc);
                    setErrorMessage(null);
                  }}
                />

                {/* 2. Available Rooftop Area Input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Available Rooftop Area (m²) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      required
                      value={roofArea}
                      onChange={(e) => setRoofArea(e.target.value)}
                      placeholder="e.g. 120"
                      className="w-full pl-3.5 pr-12 py-2.5 text-sm bg-slate-900/90 border border-slate-700 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-inner font-semibold"
                    />
                    <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                      m²
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    ≈ Est. capacity of {(parseFloat(roofArea) * 0.10 || 0).toFixed(1)} kWp system size
                  </span>
                </div>

                {/* Submit CTA Button (Warm Amber Opaque Fill) */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/30 border border-amber-300/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                      <span>Simulating Solar Irradiance...</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-5 h-5 text-slate-950" />
                      <span>Assess Solar Potential</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column (7 Cols): Results, Monthly Chart & Subsidies */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Assessment Result Card */}
            {assessmentResult ? (
              <ResultCard
                type="solar"
                result={assessmentResult}
                locationInfo={selectedLocation}
              />
            ) : (
              <div className="glass-panel glass-blur rounded-2xl p-8 text-center border border-white/20 flex flex-col items-center justify-center min-h-[240px]">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/20 text-amber-400 mb-3">
                  <Sun className="w-10 h-10 animate-spin-slow" />
                </div>
                <h3 className="text-lg font-bold text-white">Ready for Solar Assessment</h3>
                <p className="text-xs text-slate-300 max-w-sm mt-1">
                  Select your district location and roof area on the left form to calculate your recommended solar system capacity and annual kWh generation.
                </p>
              </div>
            )}

            {/* 12-Month Solar Generation Visual Chart */}
            <div className="glass-panel glass-blur rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Monthly Solar Irradiance Profile</h3>
                    <p className="text-xs text-slate-300">
                      Average daily GHI (Global Horizontal Irradiance in kWh/m²/day)
                    </p>
                  </div>
                </div>

                {monthlyData && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-amber-300 border border-slate-700">
                    12 Month Trend
                  </span>
                )}
              </div>

              {isMonthlyLoading && (
                <div className="flex flex-col items-center justify-center py-10 text-amber-300">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p className="text-xs text-slate-300">Fetching monthly radiation metrics...</p>
                </div>
              )}

              {!isMonthlyLoading && monthlyData?.monthly_data && (
                <div>
                  {/* Visual Bar Chart */}
                  <div className="h-44 flex items-end justify-between gap-1.5 pt-4 pb-2 px-1">
                    {monthlyData.monthly_data.map((item, idx) => {
                      const heightPercent = Math.min(Math.max((item.irradiance_kwh_m2_day / maxIrr) * 100, 15), 100);
                      return (
                        <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                          {/* Value Tooltip hover */}
                          <span className="text-[10px] font-bold text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.irradiance_kwh_m2_day.toFixed(1)}
                          </span>

                          {/* Bar Graphic */}
                          <div className="w-full max-w-[28px] bg-slate-800/80 rounded-t-md overflow-hidden relative h-full flex items-end">
                            <div
                              className="w-full bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-300 rounded-t-md transition-all duration-500 group-hover:brightness-125"
                              style={{ height: `${heightPercent}%` }}
                            />
                          </div>

                          {/* Month Label */}
                          <span className="text-[11px] font-semibold text-slate-300 group-hover:text-white">
                            {MONTH_NAMES[idx] || item.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      Daily Irradiance Range: <strong>4.2 – 6.8 kWh/m²/day</strong>
                    </span>
                    <span className="text-amber-400 font-semibold">
                      Peak Months: March – May
                    </span>
                  </div>
                </div>
              )}

              {!isMonthlyLoading && !monthlyData && (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-slate-500 opacity-60" />
                  Perform a solar assessment above to visualize your 12-month solar radiation breakdown.
                </div>
              )}
            </div>

            {/* Subsidies Panel */}
            <SubsidyPanel
              type="solar"
              state={selectedLocation ? selectedLocation.state : ''}
            />
          </div>
        </div>
      </main>
    </PageBackground>
  );
}
