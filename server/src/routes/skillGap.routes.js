import { Router } from 'express';
import {
  performAnalysis,
  getAnalyses,
  getAnalysisById,
  deleteAnalysis,
} from '../controllers/skillGap.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Run skill gap comparison and persist in MongoDB
router.post('/analyze', optionalAuth, performAnalysis);

// Retrieve saved analyses
router.get('/', optionalAuth, getAnalyses);

// Retrieve single analysis by ID
router.get('/:id', optionalAuth, getAnalysisById);

// Delete analysis
router.delete('/:id', optionalAuth, deleteAnalysis);

export default router;
