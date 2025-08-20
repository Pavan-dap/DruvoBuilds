// LEGACY FILE - Redirects to new API services
// This file is kept for backward compatibility
// Please use the new services from src/services/ instead

import authService from './services/auth.service.js';
import projectService from './services/project.service.js';
import taskService from './services/task.service.js';
import { apiService } from './services/api.service.js';

// Export legacy API objects for backward compatibility
export const authAPI = {
    login: authService.login.bind(authService),
    logout: authService.logout.bind(authService),
    getCurrentUser: authService.getCurrentUser.bind(authService)
};

export const projectAPI = {
    getProjects: projectService.getProjects.bind(projectService)
};

export const taskAPI = {
    getTasks: taskService.getTasks.bind(taskService)
};

// Export the main api instance
export default apiService;
