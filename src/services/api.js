// src/services/api.js

import axios from 'axios';

// 1. Create the Axios instance
const api = axios.create({
  // Use env var when available (set via .env.local), otherwise fallback
  baseURL: process.env.VUE_APP_API_URL || 'http://192.168.8.50:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// 2. Add Request Interceptor (Attach Token)
api.interceptors.request.use(
    (config) => {
    const token = localStorage.getItem('token'); // Get token saved by the login page
    if (token) {
      // Attach the token for every request
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Add Response Interceptor (Handle 401/Token Expiration)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error: Unable to connect to the server');
      return Promise.reject(new Error('Network error: Unable to connect to the server. Please check your network connection and ensure the backend server is running.'));
    }
    
    // Example logic for handling token expiration (401 error)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // In a real app, you would attempt to refresh the token or redirect to login.
      console.error('Token expired or invalid. Redirecting to login...');
      // router.push('/login'); 
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;