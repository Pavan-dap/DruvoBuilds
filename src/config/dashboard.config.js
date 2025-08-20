import axios from 'axios';
import { API_DASHBOARD_STATS, API_DASHBOARD_ACTIVITIES, API_DASHBOARD_NOTIFICATIONS } from '../utils/constants/Config.js';

// Create axios instance for dashboard
const dashboardAPI = axios.create({
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Add request interceptor
dashboardAPI.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor
dashboardAPI.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Helper function to handle errors
const handleError = (error) => {
    console.error('Dashboard Error:', error);
    return {
        success: false,
        error: error.response?.data?.message || error.message || 'An error occurred',
        status: error.response?.status,
        details: error.response?.data
    };
};

// Dashboard methods
export const dashboardMethods = {
    // Get dashboard statistics
    async getDashboardStats() {
        try {
            const response = await dashboardAPI.get(API_DASHBOARD_STATS);
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },

    // Get recent activities
    async getRecentActivities(limit = 10) {
        try {
            const response = await dashboardAPI.get(API_DASHBOARD_ACTIVITIES, { params: { limit } });
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },

    // Get notifications
    async getNotifications(params = {}) {
        try {
            const response = await dashboardAPI.get(API_DASHBOARD_NOTIFICATIONS, { params });
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    }
};

export default dashboardMethods;
