// Main API services export
export { default as authService } from './auth.service.js';
export { default as projectService } from './project.service.js';
export { default as taskService } from './task.service.js';
export { default as dashboardService } from './dashboard.service.js';
export { default as reportsService } from './reports.service.js';
export { default as apiService } from './api.service.js';

// Export API config
export { default as API_CONFIG } from '../config/api.config.js';

// Legacy compatibility - export all services for backward compatibility
export * from './auth.service.js';
export * from './project.service.js';
export * from './task.service.js';
export * from './dashboard.service.js';
export * from './reports.service.js';
export * from './api.service.js';
