import { Router } from 'express';
import { generateRoadmap } from '../controllers/career.controller.js';

const router = Router();

// Dynamic career roadmap generation
router.post('/roadmap', generateRoadmap);

export default router;
