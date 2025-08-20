import { apiService } from './api.service.js';
import API_CONFIG from '../config/api.config.js';

class DashboardService {
    // Get dashboard statistics
    async getDashboardStats() {
        return await apiService.get(API_CONFIG.ENDPOINTS.DASHBOARD.STATS);
    }

    // Get recent activities
    async getRecentActivities(limit = 10) {
        return await apiService.get(API_CONFIG.ENDPOINTS.DASHBOARD.RECENT_ACTIVITIES, { limit });
    }

    // Get notifications
    async getNotifications(params = {}) {
        return await apiService.get(API_CONFIG.ENDPOINTS.DASHBOARD.NOTIFICATIONS, params);
    }
}

export const dashboardService = new DashboardService();
export default dashboardService;
