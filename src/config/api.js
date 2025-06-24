import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Base URL configuration
const getBaseURL = () => {
  // Use environment variable if available, fallback to production URL
  const baseURL = process.env.REACT_NATIVE_API_URL || 'https://nm-digitalhub.com/api';
  console.log('🌐 [API] Base URL configured:', baseURL);
  return baseURL;
};

// Create axios instance
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Removed X-Requested-With header to avoid CORS preflight issues
  },
});

console.log('🌐 [API] Axios instance created with base URL:', api.defaults.baseURL);

// Token management
export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('auth_token');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const setAuthToken = async (token) => {
  try {
    if (token) {
      await AsyncStorage.setItem('auth_token', token);
    } else {
      await AsyncStorage.removeItem('auth_token');
    }
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

export const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem('auth_token');
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};

// Request interceptor for adding auth token
api.interceptors.request.use(
  async (config) => {
    console.log(`🚀 [API] Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('📋 [API] Request headers:', JSON.stringify(config.headers, null, 2));
    
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 [API] Token added to request:', token.substring(0, 20) + '...');
    } else {
      console.log('ℹ️ [API] No token available for request');
    }
    return config;
  },
  (error) => {
    console.error('❌ [API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ [API] Response: ${response.config?.method?.toUpperCase()} ${response.config?.url} - ${response.status}`);
    console.log('📄 [API] Response data preview:', JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Enhanced error logging
    console.error('❌ [API] Request failed:', {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data,
      timeout: error.code === 'ECONNABORTED',
      networkError: !error.response
    });

    if (error.code === 'ECONNABORTED') {
      console.error('⏰ [API] Request timeout - check network connection');
      // Request timeout logged to console
    }
    
    if (!error.response) {
      console.error('🌐 [API] Network error - server unreachable');
      // Network error logged to console
    }
    
    // API errors logged to console

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh token
      try {
        const refreshResponse = await api.post('/auth/refresh');
        
        if (refreshResponse && refreshResponse.data && refreshResponse.data.token) {
          const newToken = refreshResponse.data.token;
          
          await setAuthToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          return api(originalRequest);
        } else {
          console.warn('❌ [AUTH] Invalid refresh response structure');
          throw new Error('Invalid refresh response');
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await removeAuthToken();
        // Note: Navigation should be handled in the app component
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  logoutAll: () => api.post('/auth/logout-all'),
  profile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  refresh: () => api.post('/auth/refresh'),
  verify: () => api.get('/auth/verify'),
  sessions: () => api.get('/auth/sessions'),
  revokeSession: (tokenId) => api.delete(`/auth/sessions/${tokenId}`),
};

export const mobileAPI = {
  // Dashboard
  dashboard: () => api.get('/mobile/dashboard'),
  
  // Tickets
  tickets: (params = {}) => api.get('/mobile/tickets', { params }),
  getTicket: (id) => api.get(`/mobile/tickets/${id}`),
  updateTicket: (id, data) => api.put(`/mobile/tickets/${id}`, data),
  addTicketMessage: (id, data) => api.post(`/mobile/tickets/${id}/messages`, data),
  
  // Clients
  clients: (params = {}) => api.get('/mobile/clients', { params }),
  getClient: (id) => api.get(`/mobile/clients/${id}`),
  
  // Orders
  orders: (params = {}) => api.get('/mobile/orders', { params }),
  updateOrder: (id, data) => api.put(`/mobile/orders/${id}`, data),
  
  // Analytics
  analytics: (params = {}) => api.get('/mobile/analytics', { params }),
  
  // Notifications
  notifications: () => api.get('/mobile/notifications'),
};

export const whatsappAPI = {
  health: () => api.get('/whatsapp/health'),
  sendMessage: (data) => api.post('/whatsapp/send-message', data),
  sendTest: (data) => api.post('/whatsapp/send-test', data),
  connectionStatus: () => api.get('/whatsapp/connection-status'),
};

export default api;