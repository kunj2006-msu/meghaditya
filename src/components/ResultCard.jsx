import React from 'react';
import { CheckCircle2, AlertCircle, Droplets, Sun, Gauge, Calendar, ShieldCheck, HelpCircle } from 'lucide-react';

/**
 * ResultCard Component
 * Displays assessment findings inside a high-contrast glassmorphic card
 */
export default function ResultCard({ type = 'rainwater', result, locationInfo }) {
  if (!result) return null;

  const isRain = type === 'rainwater';
  const isExact = result.data_source === 'district_exact';

  // Format numbers nicely
  const formatNum = (num, decimals = 0) => {
    if (num === undefined || num === null) return '0';
    return Number(num).toLocaleString('en-IN', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    });
  };

  return (
    <div className="glass-panel glass-blur rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20 text-slate-100 transition-all animate-fadeIn">
      {/* Header & Data Source Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            {isRain ? (
              <Droplets className="w-6 h-6 text-sky-400 shrink-0" />
            ) : (
              <Sun className="w-6 h-6 text-amber-400 shrink-0" />
            )}
            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {isRain ? 'Rainwater Assessment' : 'Solar Potential Assessment'}
            </h3>
          </div>
          {locationInfo && (
            <p className="text-xs md:text-sm text-slate-300 mt-1">
              Assessment for <strong className="text-white">{locationInfo.district}</strong>, {locationInfo.state} ({result.roof_area_m2} m² rooftop)
            </p>
          )}
        </div>

        {/* Data Source Disclaimer Badge */}
        <div className="shrink-0">
          {isExact ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>District Exact Data</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold shadow-sm" title="Estimated using state regional average data">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>State Regional Average</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      {isRain ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {/* Harvestable Water */}
          <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-5 shadow-inner flex flex-col justify-between">
            <div className="flex items-center justify-between text-sky-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Annual Rainwater Yield</span>
              <Droplets className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-3xl md:text-4xl font-extrabold text-white">
                {formatNum(result.harvestable_liters_per_year)}
              </span>
              <span className="text-sm font-semibold text-sky-300">Liters / year</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              ≈ {formatNum(result.harvestable_liters_per_year / 1000, 1)} m³ (kilo-liters) collected annually
            </p>
          </div>

          {/* Suggested Tank Size */}
          <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-5 shadow-inner flex flex-col justify-between">
            <div className="flex items-center justify-between text-teal-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Recommended Storage Tank</span>
              <Gauge className="w-4 h-4 text-teal-400" />
            </div>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-3xl md:text-4xl font-extrabold text-white">
                {formatNum(result.suggested_tank_size_liters)}
              </span>
              <span className="text-sm font-semibold text-teal-300">Liters capacity</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Sized for peak monsoon runoff & storage buffer
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {/* Capacity kWp */}
          <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-5 shadow-inner flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Recommended System Size</span>
              <Sun className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-3xl md:text-4xl font-extrabold text-white">
                {formatNum(result.capacity_kwp, 1)}
              </span>
              <span className="text-sm font-semibold text-amber-300">kWp</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Kilowatt peak rooftop solar array capacity
            </p>
          </div>

          {/* Annual Generation kWh */}
          <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-5 shadow-inner flex flex-col justify-between">
            <div className="flex items-center justify-between text-orange-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Est. Annual Generation</span>
              <Calendar className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-3xl md:text-4xl font-extrabold text-white">
                {formatNum(result.annual_generation_kwh)}
              </span>
              <span className="text-sm font-semibold text-orange-300">kWh / year</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Clean electricity generated to power your home
            </p>
          </div>
        </div>
      )}

      {/* Auxiliary Info Details Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs">
        {isRain ? (
          <>
            <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">Avg. Annual Rainfall</span>
              <span className="font-semibold text-white text-sm">{formatNum(result.avg_rainfall_mm, 1)} mm</span>
            </div>
            <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">Roof Material</span>
              <span className="font-semibold text-white text-sm uppercase">{result.roof_type}</span>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">Location Verified</span>
              <span className="font-semibold text-emerald-400 text-sm flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Official IMD Data
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">Solar Irradiance</span>
              <span className="font-semibold text-white text-sm">{formatNum(result.avg_annual_irradiance, 2)} kWh/m²/day</span>
            </div>
            <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">CO₂ Reduction</span>
              <span className="font-semibold text-emerald-400 text-sm">≈ {formatNum((result.annual_generation_kwh * 0.82) / 1000, 1)} Tons/yr</span>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">Est. Bill Savings</span>
              <span className="font-semibold text-amber-300 text-sm">≈ ₹{formatNum(result.annual_generation_kwh * 7.5)} /yr</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
