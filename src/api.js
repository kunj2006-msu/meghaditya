import axios from 'axios';
import { API_BASE_URL } from './config';

/**
 * Centralized Axios instance for Meghaditya API requests.
 * Configured with a 60-second timeout to handle backend cold-start wake-up latency on free-tier hosting (e.g. Render).
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout for cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
