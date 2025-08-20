const IMG_URL_PATH = import.meta.env.VITE_IMG_URL_PATH || import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";

export const API_MEDIA = IMG_URL_PATH;

// Authentication endpoints
export const API_SIGNIN = `${API_BASE_URL}login_view/`;
export const API_LOGOUT = `${API_BASE_URL}logout/`;
export const API_REGISTER = `${API_BASE_URL}register/`;
export const API_PROFILE = `${API_BASE_URL}user/profile/`;
export const API_REFRESH_TOKEN = `${API_BASE_URL}refresh-token/`;

// Project endpoints
export const API_PROJECTS = `${API_BASE_URL}Project_View/`;
export const API_PROJECT_DETAILS = `${API_BASE_URL}Project_Details_View/`;
export const API_PROJECT_DETAILS_UNITS = `${API_BASE_URL}Master_units_View/`;



// Task endpoints
export const API_TASKS = `${API_BASE_URL}tasks/`;
export const API_TASK_CREATE = `${API_BASE_URL}tasks/`;
export const API_TASK_UPDATE = (id) => `${API_BASE_URL}tasks/${id}/`;
export const API_TASK_DELETE = (id) => `${API_BASE_URL}tasks/${id}/`;
export const API_TASK_DETAILS = (id) => `${API_BASE_URL}tasks/${id}/`;
export const API_TASKS_BY_PROJECT = (projectId) => `${API_BASE_URL}projects/${projectId}/tasks/`;

// Report endpoints
export const API_REPORTS_DASHBOARD = `${API_BASE_URL}reports/dashboard/`;
export const API_REPORTS_PROJECT_SUMMARY = `${API_BASE_URL}reports/project-summary/`;
export const API_REPORTS_TASK_ANALYTICS = `${API_BASE_URL}reports/task-analytics/`;
export const API_REPORTS_USER_PERFORMANCE = `${API_BASE_URL}reports/user-performance/`;

// User endpoints
export const API_USERS = `${API_BASE_URL}users/`;
export const API_USER_CREATE = `${API_BASE_URL}users/`;
export const API_USER_UPDATE = (id) => `${API_BASE_URL}users/${id}/`;
export const API_USER_DELETE = (id) => `${API_BASE_URL}users/${id}/`;
export const API_USER_DETAILS = (id) => `${API_BASE_URL}users/${id}/`;

// Dashboard endpoints
export const API_DASHBOARD_STATS = `${API_BASE_URL}dashboard/stats/`;
export const API_DASHBOARD_ACTIVITIES = `${API_BASE_URL}dashboard/activities/`;
export const API_DASHBOARD_NOTIFICATIONS = `${API_BASE_URL}dashboard/notifications/`;





export const API_PROJECT_REQUIREMENTS = `${API_BASE_URL}Required_Doors_View/`;