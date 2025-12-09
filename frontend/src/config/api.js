// API Configuration
const API_CONFIG = {
  development: {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
    retries: 3
  },
  production: {
    baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL_PROD || '/api',
    timeout: 15000,
    retries: 2
  }
};

const environment = import.meta.env.MODE || 'development';
const config = API_CONFIG[environment] || API_CONFIG.development;

// Export the base URL for components that need direct access
export const API_BASE_URL = config.baseURL;

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY: '/auth/verify',
    REFRESH: '/auth/refresh'
  },
  
  // Applications
  APPLICATIONS: {
    BASE: '/applications',
    BY_STATUS: (status) => `/applications?status=${status}`,
    BY_TYPE: (type) => `/applications?type=${type}`,
    APPROVE: (id) => `/applications/${id}`,
    DENY: (id) => `/applications/${id}`,
    DELETE: (id) => `/applications/${id}`,
    BULK_ACTION: '/applications/bulk'
  },
  
  // Programs
  PROGRAMS: {
    BASE: '/programs',
    BY_ZIP: (zip) => `/programs?zipCode=${zip}`,
    BY_CITY: (city) => `/programs?city=${city}`
  },
  
  // Hero Content
  HERO: {
    BASE: '/hero-content',
    PUBLIC: '/hero-content/public',
    UPLOAD: '/hero-content/upload',
    SLIDESHOW_SETTINGS: '/hero-content/slideshow-settings'
  },
  
  // Payments
  PAYMENTS: {
    BASE: '/payments',
    ANALYTICS: '/payments/analytics',
    REFUND: (id) => `/payments/${id}/refund`,
    REFUNDS: (id) => `/payments/${id}/refunds`,
    NOTES: (id) => `/payments/${id}/notes`,
    SAMPLE_DATA: '/payments/sample-data'
  },
  
  // Settings
  SETTINGS: {
    BASE: '/settings',
    MAINTENANCE: '/settings/maintenance'
  },
  
  // Schedules
  SCHEDULES: {
    BASE: '/schedules',
    BULK: '/schedules/bulk'
  },
  
  // Gallery
  GALLERY: {
    BASE: '/gallery',
    UPLOAD: '/gallery/upload'
  },
  
  // Health
  HEALTH: '/health'
};

// API utility functions
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${config.baseURL}${endpoint}`;
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    timeout: config.timeout
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  let lastError;
  
  for (let attempt = 1; attempt <= config.retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);
      
      const response = await fetch(url, {
        ...finalOptions,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/signin';
          throw new Error('Authentication required');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
      
    } catch (error) {
      lastError = error;
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      if (attempt === config.retries) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  throw lastError;
};

// Convenience methods
export const api = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options = {}) => apiRequest(endpoint, { 
    ...options, 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  put: (endpoint, data, options = {}) => apiRequest(endpoint, { 
    ...options, 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
  upload: (endpoint, formData, options = {}) => apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: formData,
    headers: {
      ...options.headers,
      // Don't set Content-Type for FormData, let browser set it with boundary
      'Content-Type': undefined
    }
  })
};

export default api; 