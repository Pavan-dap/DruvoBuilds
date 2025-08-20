import { apiService } from './api.service.js';
import API_CONFIG from '../config/api.config.js';

class ReportsService {
    // Get dashboard reports
    async getDashboardReport(params = {}) {
        return await apiService.get(API_CONFIG.ENDPOINTS.REPORTS.DASHBOARD, params);
    }

    // Get project summary report
    async getProjectSummaryReport(params = {}) {
        return await apiService.get(API_CONFIG.ENDPOINTS.REPORTS.PROJECT_SUMMARY, params);
    }

    // Get task analytics report
    async getTaskAnalyticsReport(params = {}) {
        return await apiService.get(API_CONFIG.ENDPOINTS.REPORTS.TASK_ANALYTICS, params);
    }

    // Get user performance report
    async getUserPerformanceReport(params = {}) {
        return await apiService.get(API_CONFIG.ENDPOINTS.REPORTS.USER_PERFORMANCE, params);
    }
}

export const reportsService = new ReportsService();
export default reportsService;
