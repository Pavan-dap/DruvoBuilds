// Environment configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.29.35:8000/api";
const IMG_URL_PATH = import.meta.env.VITE_IMG_URL_PATH || import.meta.env.VITE_API_BASE_URL;

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}login_view/`,
  LOGOUT: `${API_BASE_URL}logout/`,
  PROFILE: `${API_BASE_URL}user/profile/`,
};

// Media endpoints
export const API_MEDIA = IMG_URL_PATH;

// App configuration
export const APP_CONFIG = {
  API_BASE_URL,
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

export default APP_CONFIG;
