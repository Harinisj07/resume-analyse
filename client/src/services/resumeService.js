import axios from 'axios';

// Resolve base URL for server
const SERVER_BASE = 'http://localhost:5000';

const client = axios.create({
  baseURL: SERVER_BASE,
  timeout: 45000,
});

// Attach JWT token if logged in
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Step 1: Upload resume document (PDF or DOCX) to the backend
 * Stores file on disk and creates MongoDB document with analysisStatus = 'uploaded'
 * 
 * @param {File} file - PDF or DOCX file object
 * @param {Function} onProgress - Progress callback (percentage: number) => void
 * @returns {Promise<{ success: boolean, data: { id: string, resumeId: string, fileName: string, uploadDate: string, analysisStatus: string, fileSize: number } }>}
 */
export async function uploadResume(file, onProgress) {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('file', file);

  try {
    const response = await client.post('/api/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          if (onProgress) {
            onProgress(percentCompleted);
          }
        }
      },
    });

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to upload resume document';
    const err = new Error(message);
    err.code = error.response?.data?.code || 'UPLOAD_ERROR';
    err.status = error.response?.status;
    err.data = error.response?.data;
    throw err;
  }
}

/**
 * Step 2: Trigger text extraction on an uploaded resume document
 * Calls POST /api/resume/extract/:resumeId
 * Extracts text from PDF (via pdf-parse) or DOCX (via mammoth), updates MongoDB,
 * and returns processing status along with extracted text.
 * 
 * @param {string} resumeId - MongoDB ObjectId of the uploaded resume
 * @returns {Promise<{ success: boolean, message: string, data: { id: string, resumeId: string, fileName: string, fileType: string, processingStatus: string, analysisStatus: string, extractedText: string, wordCount: number, characterCount: number, pagesCount?: number } }>}
 */
export async function extractResumeText(resumeId) {
  try {
    const response = await client.post(`/api/resume/extract/${resumeId}`);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to extract text from resume';
    const err = new Error(message);
    err.code = error.response?.data?.code || 'EXTRACTION_ERROR';
    err.status = error.response?.status;
    err.data = error.response?.data;
    throw err;
  }
}

/**
 * Retrieve extracted text preview and processing status for a resume
 * Calls GET /api/resume/:resumeId/text
 * 
 * @param {string} resumeId - Resume ID or 'my-resume'
 * @returns {Promise<any>}
 */
export async function getResumeText(resumeId) {
  try {
    const response = await client.get(`/api/resume/${resumeId}/text`);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to retrieve resume text';
    throw new Error(message);
  }
}

/**
 * Fetch the latest active uploaded resume metadata
 * @returns {Promise<any>}
 */
export async function getMyResume() {
  try {
    const response = await client.get('/api/resume/my-resume');
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'No resume record found';
    throw new Error(message);
  }
}

/**
 * Fetch list of recently uploaded / analyzed resumes
 * @returns {Promise<{ success: boolean, count: number, data: Array<any> }>}
 */
export async function getAllResumes() {
  try {
    const response = await client.get('/api/resume');
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to retrieve resume list';
    throw new Error(message);
  }
}

/**
 * Orchestrator: Full Resume Text Extraction Pipeline
 * 1. Upload File -> 2. Stored on disk & MongoDB record created -> 3. Extract text via POST /api/resume/extract/:resumeId -> 4. Return result
 * 
 * @param {File} file - PDF or DOCX file
 * @param {Function} onProgress - Upload progress callback
 * @param {Function} onStatusChange - Pipeline step callback
 * @returns {Promise<any>}
 */
export async function executeExtractionPipeline(file, onProgress, onStatusChange) {
  if (onStatusChange) onStatusChange('uploading');
  const uploadResult = await uploadResume(file, onProgress);

  const resumeId = uploadResult?.data?.id || uploadResult?.data?.resumeId;
  if (!resumeId) {
    throw new Error('Upload succeeded but no resume ID was returned from server.');
  }

  if (onStatusChange) onStatusChange('processing');
  const extractResult = await extractResumeText(resumeId);

  if (onStatusChange) onStatusChange('completed');
  return extractResult;
}

/**
 * Step 3: Trigger NLP resume analysis via Python FastAPI AI service and save in MongoDB
 * Calls POST /api/resume/analyze-resume/:resumeId (or /api/resume/analyze-resume)
 * 
 * @param {string} resumeId - Resume ID
 * @param {string} [text] - Optional direct raw text
 * @returns {Promise<{ success: boolean, message: string, data: any }>}
 */
export async function analyzeResumeNLP(resumeId, text) {
  try {
    const url = resumeId ? `/api/resume/analyze-resume/${resumeId}` : '/api/resume/analyze-resume';
    const payload = text ? { text, resumeId } : { resumeId };
    const response = await client.post(url, payload);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to perform NLP resume analysis';
    const err = new Error(message);
    err.code = error.response?.data?.code || 'NLP_ANALYSIS_ERROR';
    err.status = error.response?.status;
    err.data = error.response?.data;
    throw err;
  }
}

export default {
  uploadResume,
  extractResumeText,
  getResumeText,
  getMyResume,
  getAllResumes,
  executeExtractionPipeline,
  analyzeResumeNLP,
};
