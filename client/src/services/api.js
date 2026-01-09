// Frontend API Service

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sociopilot_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('sociopilot_token');
      localStorage.removeItem('sociopilot_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ===== AUTH API =====

export const authAPI = {
  signup: async (name, email, password) => {
    const { data } = await api.post('/api/auth/signup', {
      name,
      email,
      password
    });
    
    // Store token and user
    localStorage.setItem('sociopilot_token', data.token);
    localStorage.setItem('sociopilot_user', JSON.stringify(data.user));
    
    return data;
  },

  login: async (email, password) => {
    const { data } = await api.post('/api/auth/login', {
      email,
      password
    });
    
    // Store token and user
    localStorage.setItem('sociopilot_token', data.token);
    localStorage.setItem('sociopilot_user', JSON.stringify(data.user));
    
    return data;
  },

  logout: () => {
    localStorage.removeItem('sociopilot_token');
    localStorage.removeItem('sociopilot_user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('sociopilot_user');
    return user ? JSON.parse(user) : null;
  }
};

// ===== ANALYSIS API =====

export const analysisAPI = {
  analyze: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const { data } = await api.post('/api/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return data;
  },

  getInsights: async () => {
    const { data } = await api.get('/api/insights');
    return data;
  },

  getInsight: async (id) => {
    const { data } = await api.get(`/api/insights/${id}`);
    return data;
  },

  deleteInsight: async (id) => {
    const { data } = await api.delete(`/api/insights/${id}`);
    return data;
  }
};

// ===== USAGE IN COMPONENTS =====

/*
// Example usage in App.jsx

import { authAPI, analysisAPI } from './services/api';

// In your component:

// Signup
const handleSignup = async () => {
  try {
    const data = await authAPI.signup(name, email, password);
    setCurrentUser(data.user);
    setShowAuth(false);
  } catch (error) {
    setError(error.response?.data?.error || 'Signup failed');
  }
};

// Login
const handleLogin = async () => {
  try {
    const data = await authAPI.login(email, password);
    setCurrentUser(data.user);
    setShowAuth(false);
  } catch (error) {
    setError(error.response?.data?.error || 'Login failed');
  }
};

// Analyze
const handleAnalyze = async () => {
  try {
    setLoading(true);
    const result = await analysisAPI.analyze(file);
    setResult(result);
    
    // Refresh insights list
    const insights = await analysisAPI.getInsights();
    setSavedInsights(insights);
  } catch (error) {
    setError(error.response?.data?.error || 'Analysis failed');
  } finally {
    setLoading(false);
  }
};

// Load insights on mount
useEffect(() => {
  const loadInsights = async () => {
    try {
      const insights = await analysisAPI.getInsights();
      setSavedInsights(insights);
    } catch (error) {
      console.error('Failed to load insights:', error);
    }
  };
  
  if (currentUser) {
    loadInsights();
  }
}, [currentUser]);

// Logout
const handleLogout = () => {
  authAPI.logout();
  setCurrentUser(null);
  setSavedInsights([]);
};

*/