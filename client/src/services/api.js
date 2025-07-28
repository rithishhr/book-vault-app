// client/src/services/api.js

// This allows your app to switch between development and production environments.
// In production (e.g., deployed on Netlify), VITE_API_URL from .env will be used.
// In development, it falls back to localhost.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default BASE_URL;
