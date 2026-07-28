import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5005/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically to outgoing requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('car_rental_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid token session if unauthorized
      if (window.location.pathname !== '/login') {
        console.warn('Session token expired or invalid.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
