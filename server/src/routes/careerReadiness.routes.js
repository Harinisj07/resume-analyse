import { Router } from 'express';
import {
  calculateScore,
  getScores,
  getScoreById,
  deleteScore,
} from '../controllers/careerReadiness.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Calculate readiness score and save to MongoDB
router.post('/calculate', optionalAuth, calculateScore);

// Retrieve saved scores
router.get('/', optionalAuth, getScores);

// Retrieve score by ID
router.get('/:id', optionalAuth, getScoreById);

// Delete score record
router.delete('/:id', optionalAuth, deleteScore);

export default router;
