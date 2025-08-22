// API Configuration
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${BASE_URL}login_view/`,
  LOGOUT: `${BASE_URL}logout/`,

  // Projects
  PROJECTS: `${BASE_URL}Project_View/`,
  PROJECT_DETAILS: `${BASE_URL}Project_Details_View/`,
  PROJECT_REQUIREMENTS: `${BASE_URL}Required_Doors_View/`,
  PROJECT_SUPPLY: `${BASE_URL}Supplied_Doors_View/`,
  PROJECT_HANDLE: `${BASE_URL}Project_Handlers_View/`,

  // Tasks
  TASKS_PROJECTS: `${BASE_URL}Tasks_View/`,
  TASKS: `${BASE_URL}Tasks_View/`,
  TASKS_DETAILS: `${BASE_URL}Tasks_Details_View/`,

  // Users
  USERS: `${BASE_URL}Users_View/`,
  USERS_LIST: `${BASE_URL}Employee_List/`,

  // Tasks
  TASK_DETAILS: `${BASE_URL}task/details/`,

  // Reports
  REPORTS: `${BASE_URL}reports/`,
  ANALYTICS: `${BASE_URL}analytics/`,

};

export const APP_CONFIG = {
  TIMEOUT: 10000,
  STORAGE_KEYS: {
    TOKEN: 'token',
    USER: 'user',
    REFRESH_TOKEN: 'refreshToken',
  },
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

export default {
  API_ENDPOINTS,
  APP_CONFIG,
  BASE_URL
};