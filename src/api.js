const rawUrl = import.meta.env.VITE_API_URL || 
               (window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin);

// Hilangkan trailing slash jika ada
const API_BASE_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

export default API_BASE_URL;
