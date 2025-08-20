import { apiService } from './api.service.js';
import API_CONFIG from '../config/api.config.js';

class AuthService {
    // Login user
    async login(user_id, password) {
        const result = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
            user_id,
            password
        });
        
        if (result.success && result.data.token) {
            // Store auth data
            localStorage.setItem(API_CONFIG.STORAGE_KEYS.TOKEN, result.data.token);
            localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER, JSON.stringify(result.data.user));
            
            if (result.data.refresh_token) {
                localStorage.setItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, result.data.refresh_token);
            }
        }
        
        return result;
    }

    // Logout user
    async logout() {
        try {
            // Call logout endpoint
            await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
            // Continue with local cleanup even if server logout fails
            console.warn('Server logout failed:', error);
        }
        
        // Clear local storage
        this.clearAuthData();
        return { success: true };
    }

    // Get current user profile
    async getCurrentUser() {
        return await apiService.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
    }

    // Register new user
    async register(userData) {
        return await apiService.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
    }

    // Refresh token
    async refreshToken() {
        const refreshToken = localStorage.getItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) {
            return { success: false, error: 'No refresh token found' };
        }

        const result = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN, {
            refresh_token: refreshToken
        });

        if (result.success && result.data.token) {
            localStorage.setItem(API_CONFIG.STORAGE_KEYS.TOKEN, result.data.token);
        }

        return result;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN);
    }

    // Get stored user data
    getUser() {
        const userData = localStorage.getItem(API_CONFIG.STORAGE_KEYS.USER);
        return userData ? JSON.parse(userData) : null;
    }

    // Get stored token
    getToken() {
        return localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN);
    }

    // Clear authentication data
    clearAuthData() {
        localStorage.removeItem(API_CONFIG.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER);
        localStorage.removeItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    }
}

export const authService = new AuthService();
export default authService;
