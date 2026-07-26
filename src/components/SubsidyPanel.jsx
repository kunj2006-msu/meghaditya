import React, { useState, useEffect } from 'react';
import { Award, ExternalLink, Phone, Loader2, Sparkles, AlertCircle, Building2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

/**
 * SubsidyPanel Component
 * Displays government schemes & financial incentives fetched from GET /subsidies?type={type}&state={state}
 */
export default function SubsidyPanel({ type = 'rainwater', state = '' }) {
  const [subsidies, setSubsidies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!state) return;

    async function fetchSubsidies() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/subsidies?type=${type}&state=${encodeURIComponent(state)}`);
        if (!response.ok) {
          throw new Error(`Failed to load subsidy data (${response.status})`);
        }
        const data = await response.json();
        setSubsidies(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading subsidies:', err);
        setError('Unable to fetch subsidy schemes for this location.');
        setSubsidies([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubsidies();
  }, [type, state]);

  const isRain = type === 'rainwater';
  const badgeColor = isRain ? 'bg-sky-500/20 text-sky-300 border-sky-400/30' : 'bg-amber-500/20 text-amber-300 border-amber-400/30';
  const accentBtn = isRain ? 'bg-sky-600 hover:bg-sky-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold';

  if (!state) {
    return (
      <div className="glass-panel glass-blur rounded-2xl p-6 border border-white/20 text-center text-slate-300">
        <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
        <p className="text-sm">Select a location above to view applicable state government subsidies & schemes.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel glass-blur rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20 text-slate-100 transition-all">
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">Government Schemes & Subsidies</h4>
            <p className="text-xs text-slate-300">Official incentives available in <strong className="text-white">{state}</strong></p>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColor} capitalize`}>
          {type} Incentives
        </span>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-10 text-slate-300">
          <Loader2 className="w-8 h-8 animate-spin text-sky-400 mb-2" />
          <p className="text-sm">Fetching government subsidy programs for {state}...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <p>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && subsidies.length === 0 && (
        <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-6 text-center">
          <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
          <h5 className="font-semibold text-white text-sm">Central & State Incentives Applicable</h5>
          <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
            While no state-specific {type} scheme entry was found for {state}, standard Central Government guidelines (e.g. PM Surya Ghar / Jal Shakti Abhiyan) apply. Contact your municipal corporation for local rebate options.
          </p>
        </div>
      )}

      {/* Subsidies List */}
      {!isLoading && !error && subsidies.length > 0 && (
        <div className="space-y-4">
          {subsidies.map((scheme) => (
            <div 
              key={scheme.id || scheme.scheme_name}
              className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-5 shadow-lg transition-all hover:border-slate-600"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                <h5 className="font-bold text-white text-base leading-snug">
                  {scheme.scheme_name}
                </h5>
                <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/80 self-start">
                  Active Scheme
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {scheme.subsidy_details}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
                {scheme.helpline_number ? (
                  <a
                    href={`tel:${scheme.helpline_number}`}
                    className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Helpline: <strong className="text-white">{scheme.helpline_number}</strong></span>
                  </a>
                ) : (
                  <span className="text-slate-400 italic text-[11px]">Contact Municipal Portal</span>
                )}

                {scheme.website_url && (
                  <a
                    href={scheme.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-md ${accentBtn}`}
                  >
                    <span>Apply / Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
