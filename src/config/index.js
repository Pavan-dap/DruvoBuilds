// Main config exports
export { default as authMethods } from './auth.config.js';
export { default as projectMethods } from './project.config.js';
export { default as taskMethods } from './task.config.js';
export { default as dashboardMethods } from './dashboard.config.js';
export { default as reportsMethods } from './reports.config.js';
export { default as API_CONFIG } from './api.config.js';
export { default as ENV_CONFIG } from './environment.js';

// Named exports for backward compatibility
export { authMethods } from './auth.config.js';
export { projectMethods } from './project.config.js';
export { taskMethods } from './task.config.js';
export { dashboardMethods } from './dashboard.config.js';
export { reportsMethods } from './reports.config.js';

// Export all constants from Config.js
export * from '../utils/constants/Config.js';
