import axios from 'axios';

/**
 * Separate Axios instance for all admin API calls.
 * Reads adminToken from localStorage and attaches it as Authorization: Bearer <token>.
 */
const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Admin API error';
    return Promise.reject(new Error(message));
  }
);

export default adminApi;
