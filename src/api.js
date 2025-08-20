import axios from "axios";

// Commented out for demo - will be used when backend is ready
/*
const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api/", // Django backend API URL
    headers: {
        "Content-Type": "application/json",
    },
});
*/

// Demo API functions for frontend-only authentication
const api = {
    // Auth endpoints
    login: async (credentials) => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // This will be replaced with actual API call
        // return axios.post('/auth/login/', credentials);
        
        // For now, return demo response
        return {
            data: {
                success: true,
                user: credentials // This would be actual user data from backend
            }
        };
    },
    
    logout: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { data: { success: true } };
    },
    
    getCurrentUser: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        // This would fetch current user from backend
        return { data: { user: null } };
    },
    
    // Other API endpoints can be added here
    getProjects: async () => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return { data: { projects: [] } };
    },
    
    getTasks: async () => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return { data: { tasks: [] } };
    }
};
export default api;
