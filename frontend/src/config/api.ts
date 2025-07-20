// API configuration for different environments
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV 
    ? (typeof window !== 'undefined' && window.location.hostname.includes('github.dev')
        ? window.location.origin.replace('-5173', '-8000')  // Codespace environment
        : "http://localhost:8000")  // Local development
    : "https://codecoach-production.up.railway.app");  // Production

export { API_BASE_URL };
