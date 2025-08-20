import { apiService } from './api.service.js';
import API_CONFIG from '../config/api.config.js';

class ProjectService {
    // Get all projects
    async getProjects(params = {}) {
        return await apiService.get(API_CONFIG.ENDPOINTS.PROJECTS.LIST, params);
    }

    // Get project by ID
    async getProject(id) {
        return await apiService.get(API_CONFIG.ENDPOINTS.PROJECTS.DETAILS(id));
    }

    // Create new project
    async createProject(projectData) {
        return await apiService.post(API_CONFIG.ENDPOINTS.PROJECTS.CREATE, projectData);
    }

    // Update project
    async updateProject(id, projectData) {
        return await apiService.put(API_CONFIG.ENDPOINTS.PROJECTS.UPDATE(id), projectData);
    }

    // Partially update project
    async patchProject(id, projectData) {
        return await apiService.patch(API_CONFIG.ENDPOINTS.PROJECTS.UPDATE(id), projectData);
    }

    // Delete project
    async deleteProject(id) {
        return await apiService.delete(API_CONFIG.ENDPOINTS.PROJECTS.DELETE(id));
    }

    // Get project tasks
    async getProjectTasks(projectId) {
        return await apiService.get(API_CONFIG.ENDPOINTS.TASKS.BY_PROJECT(projectId));
    }
}

export const projectService = new ProjectService();
export default projectService;
