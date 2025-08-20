import { apiService } from './api.service.js';
import API_CONFIG from '../config/api.config.js';

class TaskService {
    // Get all tasks
    async getTasks(params = {}) {
        return await apiService.get(API_CONFIG.ENDPOINTS.TASKS.LIST, params);
    }

    // Get task by ID
    async getTask(id) {
        return await apiService.get(API_CONFIG.ENDPOINTS.TASKS.DETAILS(id));
    }

    // Create new task
    async createTask(taskData) {
        return await apiService.post(API_CONFIG.ENDPOINTS.TASKS.CREATE, taskData);
    }

    // Update task
    async updateTask(id, taskData) {
        return await apiService.put(API_CONFIG.ENDPOINTS.TASKS.UPDATE(id), taskData);
    }

    // Partially update task
    async patchTask(id, taskData) {
        return await apiService.patch(API_CONFIG.ENDPOINTS.TASKS.UPDATE(id), taskData);
    }

    // Delete task
    async deleteTask(id) {
        return await apiService.delete(API_CONFIG.ENDPOINTS.TASKS.DELETE(id));
    }

    // Get tasks by project
    async getTasksByProject(projectId) {
        return await apiService.get(API_CONFIG.ENDPOINTS.TASKS.BY_PROJECT(projectId));
    }
}

export const taskService = new TaskService();
export default taskService;
