import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X, Check } from 'lucide-react';
import { API_BASE_URL } from '../config';

/**
 * LocationSearch Component
 * Provides debounced location autocomplete searching via backend GET /locations/search?q=
 */
export default function LocationSearch({ onSelectLocation, selectedLocation = null, className = "" }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  // Debounced search effect
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/locations/search?q=${encodeURIComponent(query.trim())}`);
        if (!response.ok) {
          throw new Error(`Location fetch failed (${response.status})`);
        }
        const data = await response.json();
        setResults(Array.isArray(data) ? data : []);
        setIsOpen(true);
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('Failed to load locations. Please check backend connection.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc) => {
    onSelectLocation(loc);
    setQuery('');
    setIsOpen(false);
    setResults([]);
  };

  const handleClearSelected = () => {
    onSelectLocation(null);
    setQuery('');
  };

  return (
    <div className={`relative w-full ${isOpen ? 'z-50' : 'z-30'} ${className}`} ref={dropdownRef}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
        Location (District & State) <span className="text-rose-400">*</span>
      </label>

      {selectedLocation ? (
        // Selected Location Badge View
        <div className="flex items-center justify-between p-3 rounded-lg bg-sky-950/80 border border-sky-400/40 text-sky-100 shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-full bg-sky-500/20 text-sky-300 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="font-bold text-white text-sm">{selectedLocation.district}</span>
              <span className="text-xs text-sky-300 ml-1.5">({selectedLocation.state})</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearSelected}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Change Location"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // Search Input View
        <div className="relative z-50">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            placeholder="Search city or district (e.g. Pune, Jaipur)..."
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-900/90 border border-slate-700 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-inner transition-all"
          />

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-10">
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
            ) : query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          {/* Autocomplete Dropdown */}
          {isOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1.5 w-full bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
              {error && (
                <div className="p-3 text-xs text-rose-400 bg-rose-950/40">
                  {error}
                </div>
              )}

              {!isLoading && results.length === 0 && query.trim().length >= 2 && !error && (
                <div className="p-3 text-xs text-slate-400 text-center">
                  No matching locations found for "{query}".
                </div>
              )}

              {results.map((loc) => (
                <button
                  key={loc.location_id}
                  type="button"
                  onClick={() => handleSelect(loc)}
                  className="w-full text-left px-3.5 py-2.5 text-sm text-slate-200 hover:bg-sky-600/30 hover:text-white flex items-center justify-between transition-colors border-b border-slate-800/60 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>
                      <strong className="text-white">{loc.district}</strong>
                      <span className="text-slate-400 text-xs ml-1.5">, {loc.state}</span>
                    </span>
                  </div>
                  <Check className="w-3.5 h-3.5 text-sky-400 opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
