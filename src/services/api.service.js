import axios from "axios";
import API_CONFIG from "../config/api.config.js";

// Create axios instance with base configuration
const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: API_CONFIG.DEFAULT_HEADERS,
    timeout: API_CONFIG.TIMEOUT,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === API_CONFIG.STATUS_CODES.UNAUTHORIZED) {
            // Clear auth data on unauthorized
            localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER);
            localStorage.removeItem(API_CONFIG.STORAGE_KEYS.TOKEN);
            localStorage.removeItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Generic API service methods
class APIService {
    // Generic GET request
    async get(endpoint, params = {}) {
        try {
            const response = await api.get(endpoint, { params });
            return { success: true, data: response.data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Generic POST request
    async post(endpoint, data = {}) {
        try {
            const response = await api.post(endpoint, data);
            return { success: true, data: response.data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Generic PUT request
    async put(endpoint, data = {}) {
        try {
            const response = await api.put(endpoint, data);
            return { success: true, data: response.data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Generic PATCH request
    async patch(endpoint, data = {}) {
        try {
            const response = await api.patch(endpoint, data);
            return { success: true, data: response.data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Generic DELETE request
    async delete(endpoint) {
        try {
            const response = await api.delete(endpoint);
            return { success: true, data: response.data };
        } catch (error) {
            return this.handleError(error);
        }
    }

    // Error handler
    handleError(error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'An error occurred',
            status: error.response?.status,
            details: error.response?.data
        };
    }
}

export const apiService = new APIService();
export default api;
