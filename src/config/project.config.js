import axios from 'axios';
import { API_PROJECTS, API_PROJECT_CREATE, API_PROJECT_UPDATE, API_PROJECT_DELETE, API_PROJECT_DETAILS, API_TASKS_BY_PROJECT } from '../utils/constants/Config.js';

// Create axios instance for projects
const projectAPI = axios.create({
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Add request interceptor
projectAPI.interceptors.request.use(
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
projectAPI.interceptors.response.use(
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
    console.error('Project Error:', error);
    return {
        success: false,
        error: error.response?.data?.message || error.message || 'An error occurred',
        status: error.response?.status,
        details: error.response?.data
    };
};

// Project methods
export const projectMethods = {
    // Get all projects
    async getProjects(params = {}) {
        try {
            const response = await projectAPI.get(API_PROJECTS, { params });
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },

    // Get project by ID
    async getProject(id) {
        try {
            const response = await projectAPI.get(API_PROJECT_DETAILS(id));
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },

    // Create new project
    async createProject(projectData) {
        try {
            const response = await projectAPI.post(API_PROJECT_CREATE, projectData);
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },

    // Update project
    async updateProject(id, projectData) {
        try {
            const response = await projectAPI.put(API_PROJECT_UPDATE(id), projectData);
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },

    // Partially update project
    async patchProject(id, projectData) {
        try {
            const response = await projectAPI.patch(API_PROJECT_UPDATE(id), projectData);
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },

    // Delete project
    async deleteProject(id) {
        try {
            const response = await projectAPI.delete(API_PROJECT_DELETE(id));
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },

    // Get project tasks
    async getProjectTasks(projectId) {
        try {
            const response = await projectAPI.get(API_TASKS_BY_PROJECT(projectId));
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    }
};

export default projectMethods;
