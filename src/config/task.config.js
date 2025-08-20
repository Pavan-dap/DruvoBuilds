import axios from 'axios';
import { API_TASKS, API_TASK_CREATE, API_TASK_UPDATE, API_TASK_DELETE, API_TASK_DETAILS, API_TASKS_BY_PROJECT } from '../utils/constants/Config.js';

// Create axios instance for tasks
const taskAPI = axios.create({
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Add request interceptor
taskAPI.interceptors.request.use(
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
taskAPI.interceptors.response.use(
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
    console.error('Task Error:', error);
    return {
        success: false,
        error: error.response?.data?.message || error.message || 'An error occurred',
        status: error.response?.status,
        details: error.response?.data
    };
};

// Task methods
export const taskMethods = {
    // Get all tasks
    async getTasks(params = {}) {
        try {
            const response = await taskAPI.get(API_TASKS, { params });
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },

    // Get task by ID
    async getTask(id) {
        try {
            const response = await taskAPI.get(API_TASK_DETAILS(id));
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },

    // Create new task
    async createTask(taskData) {
        try {
            const response = await taskAPI.post(API_TASK_CREATE, taskData);
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },

    // Update task
    async updateTask(id, taskData) {
        try {
            const response = await taskAPI.put(API_TASK_UPDATE(id), taskData);
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },

    // Partially update task
    async patchTask(id, taskData) {
        try {
            const response = await taskAPI.patch(API_TASK_UPDATE(id), taskData);
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },

    // Delete task
    async deleteTask(id) {
        try {
            const response = await taskAPI.delete(API_TASK_DELETE(id));
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    },

    // Get tasks by project
    async getTasksByProject(projectId) {
        try {
            const response = await taskAPI.get(API_TASKS_BY_PROJECT(projectId));
            return { success: true, data: response.data };
        } catch (error) {
            return handleError(error);
        }
    }
};

export default taskMethods;
