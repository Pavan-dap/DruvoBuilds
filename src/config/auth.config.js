import axios from 'axios';
import { API_SIGNIN, API_LOGOUT, API_PROFILE, API_REGISTER, API_REFRESH_TOKEN } from '../utils/constants/Config.js';

// Create axios instance for auth
const authAPI = axios.create({
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Storage keys
const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
    REFRESH_TOKEN: 'refreshToken',
};

// Add request interceptor
authAPI.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor
authAPI.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            clearAuthData();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Helper function to handle errors
const handleError = (error) => {
    console.error('Auth Error:', error);
    return {
        success: false,
        error: error.response?.data?.message || error.message || 'An error occurred',
        status: error.response?.status,
        details: error.response?.data
    };
};

// Clear authentication data
const clearAuthData = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
};

// Authentication methods
export const authMethods = {
    // Login user
    async login(user_id, password) {
        try {
            const response = await authAPI.post(API_SIGNIN, { user_id, password });
            const result = { success: true, data: response.data };
            
            if (result.success && result.data.token) {
                localStorage.setItem(STORAGE_KEYS.TOKEN, result.data.token);
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.data.user));
                
                if (result.data.refresh_token) {
                    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, result.data.refresh_token);
                }
            }
            
            return result;
        } catch (error) {
            return handleError(error);
        }
    },

    // Logout user
    async logout() {
        try {
            await authAPI.post(API_LOGOUT);
        } catch (error) {
            console.warn('Server logout failed:', error);
        }
        
        clearAuthData();
        return { success: true };
    },

    // Get current user profile
    async getCurrentUser() {
        try {
            const response = await authAPI.get(API_PROFILE);
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },

    // Register new user
    async register(userData) {
        try {
            const response = await authAPI.post(API_REGISTER, userData);
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },

    // Refresh token
    async refreshToken() {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) {
            return { success: false, error: 'No refresh token found' };
        }

        try {
            const response = await authAPI.post(API_REFRESH_TOKEN, { refresh_token: refreshToken });
            const result = { success: true, data: response.data };

            if (result.success && result.data.token) {
                localStorage.setItem(STORAGE_KEYS.TOKEN, result.data.token);
            }

            return result;
        } catch (error) {
            return handleError(error);
        }
    },

    // Check if user is authenticated
    isAuthenticated() {
        return !!localStorage.getItem(STORAGE_KEYS.TOKEN);
    },

    // Get stored user data
    getUser() {
        const userData = localStorage.getItem(STORAGE_KEYS.USER);
        return userData ? JSON.parse(userData) : null;
    },

    // Get stored token
    getToken() {
        return localStorage.getItem(STORAGE_KEYS.TOKEN);
    },

    // Clear authentication data
    clearAuthData
};

export default authMethods;
