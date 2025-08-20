import axios from 'axios';
import { API_REPORTS_DASHBOARD, API_REPORTS_PROJECT_SUMMARY, API_REPORTS_TASK_ANALYTICS, API_REPORTS_USER_PERFORMANCE } from '../utils/constants/Config.js';

// Create axios instance for reports
const reportsAPI = axios.create({
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Add request interceptor
reportsAPI.interceptors.request.use(
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
reportsAPI.interceptors.response.use(
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
    console.error('Reports Error:', error);
    return {
        success: false,
        error: error.response?.data?.message || error.message || 'An error occurred',
        status: error.response?.status,
        details: error.response?.data
    };
};

// Reports methods
export const reportsMethods = {
    // Get dashboard reports
    async getDashboardReport(params = {}) {
        try {
            const response = await reportsAPI.get(API_REPORTS_DASHBOARD, { params });
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },

    // Get project summary report
    async getProjectSummaryReport(params = {}) {
        try {
            const response = await reportsAPI.get(API_REPORTS_PROJECT_SUMMARY, { params });
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },

    // Get task analytics report
    async getTaskAnalyticsReport(params = {}) {
        try {
            const response = await reportsAPI.get(API_REPORTS_TASK_ANALYTICS, { params });
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },

    // Get user performance report
    async getUserPerformanceReport(params = {}) {
        try {
            const response = await reportsAPI.get(API_REPORTS_USER_PERFORMANCE, { params });
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    }
};

export default reportsMethods;
