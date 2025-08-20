import ENV_CONFIG from './environment.js';

// API Configuration
const API_CONFIG = {
  // Base URL for the API
  BASE_URL: ENV_CONFIG.API_BASE_URL,

  // Timeout for API requests (in milliseconds)
  TIMEOUT: 10000,

  // API Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: 'login_view/',
      LOGOUT: 'logout/',
      PROFILE: 'user/profile/',
      REGISTER: 'register/',
      REFRESH_TOKEN: 'refresh-token/',
    },

    // Projects
    PROJECTS: {
      LIST: '/projects/',
      CREATE: '/projects/',
      UPDATE: (id) => `/projects/${id}/`,
      DELETE: (id) => `/projects/${id}/`,
      DETAILS: (id) => `/projects/${id}/`,
    },

    // Tasks
    TASKS: {
      LIST: '/tasks/',
      CREATE: '/tasks/',
      UPDATE: (id) => `/tasks/${id}/`,
      DELETE: (id) => `/tasks/${id}/`,
      DETAILS: (id) => `/tasks/${id}/`,
      BY_PROJECT: (projectId) => `/projects/${projectId}/tasks/`,
    },

    // Reports
    REPORTS: {
      DASHBOARD: '/reports/dashboard/',
      PROJECT_SUMMARY: '/reports/project-summary/',
      TASK_ANALYTICS: '/reports/task-analytics/',
      USER_PERFORMANCE: '/reports/user-performance/',
    },

    // Users
    USERS: {
      LIST: '/users/',
      CREATE: '/users/',
      UPDATE: (id) => `/users/${id}/`,
      DELETE: (id) => `/users/${id}/`,
      DETAILS: (id) => `/users/${id}/`,
    },

    // Dashboard
    DASHBOARD: {
      STATS: '/dashboard/stats/',
      RECENT_ACTIVITIES: '/dashboard/activities/',
      NOTIFICATIONS: '/dashboard/notifications/',
    }
  },

  // HTTP Status Codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },

  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // Storage keys
  STORAGE_KEYS: {
    TOKEN: 'token',
    USER: 'user',
    REFRESH_TOKEN: 'refreshToken',
  }
};

export default API_CONFIG;
