import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000, // 10 second timeout
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
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
        if (error.response?.status === 401) {
            // Clear auth data on unauthorized
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API functions
export const authAPI = {
    login: async (user_id, password) => {
        try {
            const response = await api.post(import.meta.env.VITE_LOGIN_ENDPOINT || '/login_view/', {
                user_id,
                password
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                error: error.response?.data?.message || error.message || 'Login failed'
            };
        }
    },
    
    logout: async () => {
        try {
            await api.post('/logout/');
            return { success: true };
        } catch (error) {
            // Even if logout fails on server, clear local data
            return { success: true };
        }
    },
    
    getCurrentUser: async () => {
        try {
            const response = await api.get('/user/profile/');
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// Other API endpoints
export const projectAPI = {
    getProjects: async () => {
        try {
            const response = await api.get('/projects/');
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

export const taskAPI = {
    getTasks: async () => {
        try {
            const response = await api.get('/tasks/');
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

export default api;
