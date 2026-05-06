// Shared API base URL — reads the value baked in at build time by vite.config.js
// In production: points to Render backend
// In development: empty string (Vite proxy handles /api/* → localhost:8000)
const API_BASE = (typeof __API_BASE__ !== 'undefined' && __API_BASE__)
  ? __API_BASE__
  : ''

export const apiUrl = (path) => `${API_BASE}${path}`
