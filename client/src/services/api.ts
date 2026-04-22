import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${baseURL}/api`,
  withCredentials: false,
});

export const API_ORIGIN = baseURL;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pm_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('pm_token');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);
