import React, { useState } from 'react';
import { Droplets, ArrowLeft, Loader2, Sparkles, AlertCircle, Users, Download, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageBackground from '../components/PageBackground';
import Navbar from '../components/Navbar';
import LocationSearch from '../components/LocationSearch';
import ResultCard from '../components/ResultCard';
import SubsidyPanel from '../components/SubsidyPanel';
import rainScene from '../assets/rain-scene.png';
import api from '../api';
import useApiRequest from '../hooks/useApiRequest';

/**
 * RainwaterDashboard View
 * Rendered with rainScene image background static (motion=false)
 * Staged entrance animation plays on every mount (~1.5s total).
 */
export default function RainwaterDashboard() {
  const navigate = useNavigate();

  // Determine if entrance animations should play (respects reduced motion)
  const [shouldAnimate] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
    return true;
  });

  // Form State
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [roofArea, setRoofArea] = useState('120');
  const [roofType, setRoofType] = useState('rcc');
  const [householdSize, setHouseholdSize] = useState('4');

  // Async API states
  const [localError, setLocalError] = useState(null);
  const [assessmentResult, setAssessmentResult] = useState(null);

  // PDF Export states
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  // Cold-start resilient API hook
  const { loading: isSubmitting, slowLoadMessage, error: apiError, request: executeRequest } = useApiRequest();

  const displayError = localError || apiError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLocation) {
      setLocalError('Please select a district location from the search bar.');
      return;
    }

    const areaNum = parseFloat(roofArea);
    if (isNaN(areaNum) || areaNum <= 0) {
      setLocalError('Please enter a valid positive roof area (m²).');
      return;
    }

    setLocalError(null);

    try {
      const payload = {
        location_id: selectedLocation.location_id,
        roof_area_m2: areaNum,
        roof_type: roofType,
        household_size: parseInt(householdSize, 10) || 4,
      };

      const data = await executeRequest({
        url: '/assess/rainwater',
        method: 'POST',
        data: payload,
      });

      setAssessmentResult(data);
      setPdfError(null);
    } catch (err) {
      // Error handled by useApiRequest
    }
  };

  // Download Branded PDF Report
  const handleDownloadPdf = async () => {
    if (!selectedLocation || !assessmentResult) return;
    setIsExportingPdf(true);
    setPdfError(null);

    try {
      const payload = {
        location_id: selectedLocation.location_id,
        roof_area_m2: parseFloat(roofArea),
        roof_type: roofType,
        household_size: parseInt(householdSize, 10) || 4,
      };

      const response = await api.post('/export/pdf/rainwater', payload, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'meghaditya-rainwater-report.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF export failed:', err);
      setPdfError('Failed to generate PDF report. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Animation helpers — inline style drives the animation with concrete values
  // (no CSS var() in shorthand — avoids browser parsing bug)
  const EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';

  const withStage = (existingClass, animClass, delay, duration) => {
    if (!shouldAnimate) return { className: existingClass };
    // Map CSS class name to its corresponding keyframe name
    const keyframeMap = {
      'anim-stage-reveal': 'stageReveal',
      'anim-stage-reveal-from-left': 'stageRevealFromLeft',
      'anim-stage-reveal-from-right': 'stageRevealFromRight',
      'anim-bg-reveal': 'bgReveal',
    };
    const keyframeName = keyframeMap[animClass] || 'stageReveal';
    return {
      className: `${existingClass} ${animClass}`,
      style: { animation: `${keyframeName} ${duration} ${EASING} ${delay} both` },
    };
  };

  // Form field stagger helper (optional polish: subtle quick stagger)
  const fieldStage = (index) => {
    const zIndexes = ['z-40', 'z-30', 'z-20', 'z-10', 'z-0'];
    const zClass = `relative ${zIndexes[index] || 'z-0'}`;
    if (!shouldAnimate) return { className: zClass };
    const delay = `${0.5 + index * 0.06}s`;
    return {
      className: `anim-stage-reveal ${zClass}`,
      style: { animation: `stageReveal 0.3s ${EASING} ${delay} both` },
    };
  };

  return (
    <PageBackground
      image={rainScene}
      motion={false}
      overlayOpacity={0.35}
      animateEntrance={shouldAnimate}
      entranceDelay="0s"
      entranceDuration="0.5s"
    >
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Header Breadcrumb & Title */}
        <div
          {...withStage(
            'flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8',
            'anim-stage-reveal',
            '0.2s',
            '0.5s'
          )}
        >
          <div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-300 hover:text-white mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-3">
              <Droplets className="w-8 h-8 text-sky-400" />
              <span>Rainwater Harvesting Potential</span>
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Calculate annual rainwater capture capacity and storage tank sizing based on District-wise Rainfall.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => navigate('/solar')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 hover:bg-amber-500/30 text-xs font-bold transition-all shadow-md"
            >
              <span>Switch to Solar Assessment</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Responsive Grid: Mobile single column, Tablet/Desktop Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (5 Cols): Form Input Panel */}
          <div
            {...withStage(
              'lg:col-span-5 flex flex-col gap-6',
              'anim-stage-reveal-from-left',
              '0.3s',
              '0.6s'
            )}
          >
            <div className="glass-panel glass-blur rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20">
              <h2 className="text-lg font-bold text-white mb-1">Assessment Inputs</h2>
              <p className="text-xs text-slate-300 mb-6">Enter your rooftop specifications to simulate harvestable runoff.</p>

              {displayError && (
                <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-3 shadow-md">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Error</strong>
                    <span>{displayError}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 1. Location Autocomplete */}
                <div {...fieldStage(0)}>
                  <LocationSearch
                    selectedLocation={selectedLocation}
                    onSelectLocation={(loc) => {
                      setSelectedLocation(loc);
                      setLocalError(null);
                    }}
                  />
                </div>

                {/* 2. Roof Area Input */}
                <div {...fieldStage(1)}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Roof Catchment Area (m²) <span className="text-rose-400">*</span>
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
                      className="w-full pl-3.5 pr-12 py-2.5 text-sm bg-slate-900/90 border border-slate-700 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-inner font-semibold"
                    />
                    <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                      m²
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    ≈ {(parseFloat(roofArea) * 10.764 || 0).toFixed(0)} sq. ft.
                  </span>
                </div>

                {/* 3. Roof Surface Type Dropdown */}
                <div {...fieldStage(2)}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Roof Surface Type <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={roofType}
                    onChange={(e) => setRoofType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-900/90 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-inner font-semibold"
                  >
                    <option value="rcc">RCC Concrete Flat Roof (Runoff Coeff. 0.85)</option>
                    <option value="tiled">Tiled / Sloped Sheet Roof (Runoff Coeff. 0.75)</option>
                    <option value="green">Green / Turf Eco Roof (Runoff Coeff. 0.50)</option>
                  </select>
                </div>

                {/* 4. Optional Household Size */}
                <div {...fieldStage(3)}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Household Occupants (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Users className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={householdSize}
                      onChange={(e) => setHouseholdSize(e.target.value)}
                      placeholder="e.g. 4 occupants"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-900/90 border border-slate-700 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-inner font-semibold"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Used to estimate domestic water requirement buffers.
                  </span>
                </div>

                {/* Submit CTA Button & Cold Start Indicator */}
                <div {...fieldStage(4)}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-xl shadow-sky-600/30 border border-sky-400/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Calculating Rainwater Yield...</span>
                      </>
                    ) : (
                      <>
                        <Droplets className="w-5 h-5 text-sky-200" />
                        <span>Assess Rainwater Potential</span>
                      </>
                    )}
                  </button>

                  {/* Cold-start notification after 4s pending delay */}
                  {isSubmitting && slowLoadMessage && (
                    <div className="mt-3 p-3 rounded-lg bg-sky-950/80 border border-sky-500/40 text-sky-200 text-xs flex items-start gap-2.5 animate-fadeIn shadow-md">
                      <Loader2 className="w-4 h-4 shrink-0 animate-spin text-sky-400 mt-0.5" />
                      <span>
                        Waking up the server - this can take up to a minute on the very first request. Subsequent requests will be instant.
                      </span>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Right Column (7 Cols): Results & Subsidies */}
          <div
            {...withStage(
              'lg:col-span-7 flex flex-col gap-6',
              'anim-stage-reveal-from-right',
              '0.3s',
              '0.6s'
            )}
          >
            {/* Assessment Result Card */}
            {assessmentResult ? (
              <div className="space-y-4">
                <ResultCard
                  type="rainwater"
                  result={assessmentResult}
                  locationInfo={selectedLocation}
                />

                {/* PDF Export Banner Button */}
                <div className="glass-panel glass-blur rounded-2xl p-4 md:p-5 border border-sky-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-sky-400" />
                      <span>Official Assessment Report</span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Download a branded vector PDF report formatted for technical audits and subsidy applications.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isExportingPdf}
                    className="shrink-0 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 border border-sky-400/40 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isExportingPdf ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Generating PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-sky-200" />
                        <span>Download PDF Report</span>
                      </>
                    )}
                  </button>
                </div>

                {pdfError && (
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2 shadow-md">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{pdfError}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-panel glass-blur rounded-2xl p-8 text-center border border-white/20 flex flex-col items-center justify-center min-h-[260px]">
                <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-400/20 text-sky-400 mb-3">
                  <Droplets className="w-10 h-10 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white">Ready for Rainwater Assessment</h3>
                <p className="text-xs text-slate-300 max-w-sm mt-1">
                  Select your district location and roof area on the left form to calculate your annual harvestable rainwater liters.
                </p>
              </div>
            )}

            {/* Subsidies Panel */}
            <div
              {...(shouldAnimate
                ? {
                    className: 'anim-stage-reveal',
                    style: { animation: `stageReveal 0.5s ${EASING} 0.8s both` },
                  }
                : {})}
            >
              <SubsidyPanel
                type="rainwater"
                state={selectedLocation ? selectedLocation.state : ''}
              />
            </div>
          </div>
        </div>
      </main>
    </PageBackground>
  );
}
