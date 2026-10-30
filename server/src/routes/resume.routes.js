import { Router } from 'express';
import uploadResume from '../middleware/multer.config.js';
import { optionalAuth, protect } from '../middleware/auth.middleware.js';
import {
  uploadResumeFile,
  getMyResume,
  secureDownloadResume,
  extractResumeText,
  getResumeText,
  analyzeResumeWithNLP,
  uploadAndAnalyze,
  analyzeText,
  getAllResumes,
  getResumeById,
  deleteResume,
} from '../controllers/resume.controller.js';

const router = Router();

// Middleware to accept either 'resume' or 'file' form-data field without stream re-reading
const handleResumeUpload = (req, res, next) => {
  uploadResume.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ])(req, res, (err) => {
    if (err) return next(err);
    req.file = req.files?.resume?.[0] || req.files?.file?.[0] || null;
    next();
  });
};

/**
 * @route POST /api/resume/upload
 * @desc Upload PDF or DOCX resume document and store file in private filesystem & MongoDB
 */
router.post('/upload', optionalAuth, handleResumeUpload, uploadResumeFile);

/**
 * @route POST /api/resume/extract/:resumeId
 * @desc Extract text from uploaded PDF or DOCX file and save extractedText in MongoDB
 */
router.post('/extract/:resumeId', optionalAuth, extractResumeText);

/**
 * @route POST /api/resume/analyze-resume/:resumeId
 * @desc Run NLP analysis on resume via Python FastAPI AI service and persist structured result in MongoDB
 */
router.post('/analyze-resume/:resumeId', optionalAuth, analyzeResumeWithNLP);
router.post('/analyze-resume', optionalAuth, analyzeResumeWithNLP);

/**
 * @route GET /api/resume/my-resume
 * @desc Retrieve current user's active resume metadata (fileName, uploadDate, analysisStatus)
 */
router.get('/my-resume', optionalAuth, getMyResume);

/**
 * @route GET /api/resume/:resumeId/text
 * @desc Retrieve extracted text preview and processing status
 */
router.get('/:resumeId/text', optionalAuth, getResumeText);

/**
 * @route GET /api/resume/:id/download
 * @desc Securely download private resume file (Authorization enforced)
 */
router.get('/:id/download', optionalAuth, secureDownloadResume);

// Additional Analysis Routes (Kept for full ATS pipeline & backward compatibility)
router.post('/analyze-full', optionalAuth, handleResumeUpload, uploadAndAnalyze);
router.post('/analyze-text', optionalAuth, analyzeText);
router.get('/', optionalAuth, getAllResumes);
router.get('/:id', optionalAuth, getResumeById);
router.delete('/:id', optionalAuth, deleteResume);

export default router;
