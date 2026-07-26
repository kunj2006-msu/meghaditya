import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../api';

/**
 * useApiRequest Hook
 * 
 * Manages API call lifecycle with resilient cold-start handling:
 * - `loading`: true while request is in flight.
 * - `slowLoadMessage`: becomes true ONLY if request exceeds 4 seconds (indicates backend cold start).
 * - `error`: user-friendly error string on failure/timeout.
 * - `request`: async function executing Axios requests via src/api.js instance.
 */
export default function useApiRequest() {
  const [loading, setLoading] = useState(false);
  const [slowLoadMessage, setSlowLoadMessage] = useState(false);
  const [error, setError] = useState(null);

  // Keep reference to slow load timer so it can be cleared cleanly
  const slowTimerRef = useRef(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (slowTimerRef.current) {
        clearTimeout(slowTimerRef.current);
      }
    };
  }, []);

  const request = useCallback(async (axiosConfig) => {
    setLoading(true);
    setSlowLoadMessage(false);
    setError(null);

    // Set a 4-second threshold timer for cold-start notice
    slowTimerRef.current = setTimeout(() => {
      setSlowLoadMessage(true);
    }, 4000);

    try {
      // Execute request via centralized api instance
      const response = await api(axiosConfig);
      return response.data;
    } catch (err) {
      console.error('API request error:', err);
      
      let calmErrorMessage = "The server is taking longer than expected to respond. Please try again in a moment.";

      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        // Axios 60s timeout error
        calmErrorMessage = "The server is taking longer than expected to respond. Please try again in a moment.";
      } else if (err.response) {
        // Backend HTTP error response
        const detail = err.response.data?.detail;
        if (typeof detail === 'string') {
          calmErrorMessage = detail;
        } else if (Array.isArray(detail)) {
          calmErrorMessage = detail.map(d => d.msg || JSON.stringify(d)).join(', ');
        } else if (err.response.status === 404) {
          calmErrorMessage = "Requested resource or location was not found.";
        }
      } else if (err.request) {
        // Network connectivity error
        calmErrorMessage = "The server is taking longer than expected to respond. Please try again in a moment.";
      }

      setError(calmErrorMessage);
      throw err;
    } finally {
      // Always clear slow timer so fast requests never trigger slowLoadMessage
      if (slowTimerRef.current) {
        clearTimeout(slowTimerRef.current);
        slowTimerRef.current = null;
      }
      setLoading(false);
      setSlowLoadMessage(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setSlowLoadMessage(false);
    setError(null);
  }, []);

  return {
    loading,
    slowLoadMessage,
    error,
    setError,
    request,
    reset,
  };
}
