import axios from 'axios';
import config from '../config/env.js';

class AIService {
  constructor() {
    this.client = axios.create({
      baseURL: config.aiServiceUrl,
      timeout: 30000, // 30s timeout for document parsing
      headers: {
        Accept: 'application/json',
      },
    });
  }

  /**
   * Health check to AI Microservice
   */
  async checkHealth() {
    try {
      const startTime = Date.now();
      const response = await this.client.get('/health');
      const latencyMs = Date.now() - startTime;

      return {
        status: 'online',
        statusCode: response.status,
        latencyMs,
        data: response.data,
      };
    } catch (error) {
      return {
        status: 'offline',
        statusCode: error.response?.status || null,
        error: error.message,
        details: error.response?.data || null,
      };
    }
  }

  /**
   * Send resume text for AI NLP analysis
   */
  async analyzeResume(rawText, targetRole, targetJobDescription) {
    try {
      const response = await this.client.post(
        '/api/v1/analyze',
        {
          raw_text: rawText,
          target_role: targetRole || undefined,
          target_job_description: targetJobDescription || undefined,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.detail?.[0]?.msg ||
        error.response?.data?.detail ||
        error.response?.data?.message ||
        `AI Service analysis failed: ${error.message}`
      );
    }
  }

  /**
   * Send extracted resume text for structured NLP analysis
   * Calls FastAPI POST /analyze-resume
   * Returns structured skills, languages, frameworks, databases, cloud, devops, certs, edu, projects, experience, softSkills
   */
  async analyzeResumeNLP(text) {
    try {
      const response = await this.client.post(
        '/analyze-resume',
        { text },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.detail?.[0]?.msg ||
        error.response?.data?.detail ||
        error.response?.data?.message ||
        `AI Service NLP extraction failed: ${error.message}`
      );
    }
  }

  /**
   * Upload resume document buffer (PDF, DOCX, TXT) to AI Service
   */
  async analyzeResumeFile(fileBuffer, originalname, mimetype, targetRole, targetJobDescription) {
    try {
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: mimetype || 'application/octet-stream' });
      formData.append('file', blob, originalname);

      if (targetRole) {
        formData.append('target_role', targetRole);
      }
      if (targetJobDescription) {
        formData.append('target_job_description', targetJobDescription);
      }

      const response = await this.client.post('/api/v1/analyze/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.detail?.[0]?.msg ||
        error.response?.data?.detail ||
        error.response?.data?.message ||
        `AI Service file extraction failed: ${error.message}`
      );
    }
  }

  /**
   * Generate customized career guidance roadmap
   */
  async generateCareerRoadmap(targetRole, currentSkills, experienceLevel = 'intermediate') {
    try {
      const response = await this.client.post(
        '/api/v1/career/roadmap',
        {
          target_role: targetRole,
          current_skills: currentSkills || [],
          experience_level: experienceLevel,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.detail?.[0]?.msg ||
        error.response?.data?.detail ||
        error.response?.data?.message ||
        `AI Service career roadmap failed: ${error.message}`
      );
    }
  }
}

export const aiService = new AIService();
export default aiService;
