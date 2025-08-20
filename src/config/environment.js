// Environment configuration
const ENV_CONFIG = {
  // Environment
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://192.168.29.35:8000/api",
  
  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'CRM-ERP System',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Feature Flags
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  
  // Development helpers
  isDevelopment: () => ENV_CONFIG.NODE_ENV === 'development',
  isProduction: () => ENV_CONFIG.NODE_ENV === 'production',
  isTest: () => ENV_CONFIG.NODE_ENV === 'test',
  
  // Logger configuration
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
};

export default ENV_CONFIG;
