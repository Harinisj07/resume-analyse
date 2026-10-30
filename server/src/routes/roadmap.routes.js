import { Router } from 'express';
import {
  generateRoadmap,
  getRoadmaps,
  getRoadmapById,
  updateTaskStatus,
  deleteRoadmap,
} from '../controllers/roadmap.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Generate personalized roadmap based on resume, target role, skill gaps, and readiness
router.post('/generate', optionalAuth, generateRoadmap);

// Retrieve saved roadmaps
router.get('/', optionalAuth, getRoadmaps);

// Retrieve single roadmap by ID
router.get('/:id', optionalAuth, getRoadmapById);

// Update status of a specific task within the roadmap (Not Started, In Progress, Completed)
router.patch('/:id/tasks/:taskId', optionalAuth, updateTaskStatus);
router.put('/:id/tasks/:taskId', optionalAuth, updateTaskStatus);

// Delete roadmap
router.delete('/:id', optionalAuth, deleteRoadmap);

export default router;
