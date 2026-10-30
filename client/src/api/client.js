import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30s for NLP document extraction
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: inject token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: structured error normalization
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.message ||
      'Network request failed';
    return Promise.reject(new Error(message));
  }
);

// API Service Functions
export const api = {
  // System Health
  getSystemHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // AI Microservice Health via Backend
  getAIHealth: async () => {
    const res = await apiClient.get('/ai/health');
    return res.data;
  },

  // Ping test
  ping: async () => {
    const res = await apiClient.get('/health/ping');
    return res.data;
  },

  // Upload document file (PDF, DOCX, TXT) for analysis
  uploadResumeFile: async (file, targetRole, targetJobDescription) => {
    const formData = new FormData();
    formData.append('file', file);
    if (targetRole) formData.append('targetRole', targetRole);
    if (targetJobDescription) formData.append('targetJobDescription', targetJobDescription);

    const res = await apiClient.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Resume Text Analysis
  analyzeResume: async (data) => {
    const res = await apiClient.post('/resumes/analyze', data);
    return res.data;
  },

  // Retrieve past analyses
  getResumes: async (params = {}) => {
    const res = await apiClient.get('/resumes', { params });
    return res.data;
  },

  // Retrieve single resume by ID
  getResumeById: async (id) => {
    const res = await apiClient.get(`/resumes/${id}`);
    return res.data;
  },

  // Delete saved resume
  deleteResume: async (id) => {
    const res = await apiClient.delete(`/resumes/${id}`);
    return res.data;
  },

  // Dynamic career guidance roadmap
  generateCareerRoadmap: async (targetRole, currentSkills, experienceLevel = 'intermediate') => {
    const res = await apiClient.post('/career/roadmap', {
      targetRole,
      currentSkills,
      experienceLevel,
    });
    return res.data;
  },

  // Target Roles & Categories
  getRoles: async (params = {}) => {
    const res = await apiClient.get('/roles', { params });
    return res.data;
  },

  getRoleById: async (id) => {
    const res = await apiClient.get(`/roles/${id}`);
    return res.data;
  },

  getRoleCategories: async () => {
    const res = await apiClient.get('/roles/categories');
    return res.data;
  },

  // Target Role Selection
  updateTargetRole: async ({ roleId, targetRole, roleName }) => {
    const res = await apiClient.put('/users/target-role', {
      roleId,
      targetRole,
      roleName,
    });
    return res.data;
  },

  getTargetRole: async () => {
    const res = await apiClient.get('/users/target-role');
    return res.data;
  },

  // Skill Gap Analysis Module
  analyzeSkillGap: async (payload = {}) => {
    const res = await apiClient.post('/skill-gap/analyze', payload);
    return res.data;
  },

  getSavedSkillGaps: async (params = {}) => {
    const res = await apiClient.get('/skill-gap', { params });
    return res.data;
  },

  getSkillGapById: async (id) => {
    const res = await apiClient.get(`/skill-gap/${id}`);
    return res.data;
  },

  deleteSkillGap: async (id) => {
    const res = await apiClient.delete(`/skill-gap/${id}`);
    return res.data;
  },

  // Career Readiness Score Module
  calculateCareerReadiness: async (payload = {}) => {
    const res = await apiClient.post('/career-readiness/calculate', payload);
    return res.data;
  },

  getSavedCareerReadiness: async (params = {}) => {
    const res = await apiClient.get('/career-readiness', { params });
    return res.data;
  },

  getCareerReadinessById: async (id) => {
    const res = await apiClient.get(`/career-readiness/${id}`);
    return res.data;
  },

  deleteCareerReadiness: async (id) => {
    const res = await apiClient.delete(`/career-readiness/${id}`);
    return res.data;
  },

  // Personalized Learning Roadmap Module
  generatePersonalizedRoadmap: async (payload = {}) => {
    const res = await apiClient.post('/roadmap/generate', payload);
    return res.data;
  },

  getSavedRoadmaps: async (params = {}) => {
    const res = await apiClient.get('/roadmap', { params });
    return res.data;
  },

  getRoadmapById: async (id) => {
    const res = await apiClient.get(`/roadmap/${id}`);
    return res.data;
  },

  updateRoadmapTaskStatus: async (roadmapId, taskId, status) => {
    const res = await apiClient.patch(`/roadmap/${roadmapId}/tasks/${taskId}`, { status });
    return res.data;
  },

  deleteRoadmap: async (id) => {
    const res = await apiClient.delete(`/roadmap/${id}`);
    return res.data;
  },

  // Auth
  login: async (credentials) => {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data;
  },

  register: async (userData) => {
    const res = await apiClient.post('/auth/register', userData);
    return res.data;
  },

  getProfile: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
};

export default api;
