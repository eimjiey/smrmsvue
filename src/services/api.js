// src/services/api.js

import axios from 'axios';

// 1. Create the Axios instance
const api = axios.create({
    // Use env var when available (set via .env.local), otherwise fallback
    baseURL: process.env.VUE_APP_API_URL || 'http://192.168.1.32:8000/api',
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
            console.error('Token expired or invalid. Redirecting to login...');
            // In a real app, you would attempt to refresh the token or redirect to login.
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

/**
 * 4. Export the instance and essential methods.
 * NOTE: We are explicitly adding the PATCH method here for recording actions.
 */
export default {
    // Expose the core Axios instance (if needed by other services)
    instance: api,
    
    // Core HTTP methods
    get: (url, config) => api.get(url, config),
    post: (url, data, config) => api.post(url, data, config),
    put: (url, data, config) => api.put(url, data, config),
    delete: (url, config) => api.delete(url, config),
    
    // 🎯 NEW: PATCH method for updating a single resource (like actionTaken)
    patch: (url, data, config) => api.patch(url, data, config),
};