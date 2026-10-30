import { Router } from 'express';
import { getAIHealth, analyzeResume } from '../controllers/ai.controller.js';

const router = Router();

// Dedicated AI microservice health check
router.get('/health', getAIHealth);

// Resume analysis bridge
router.post('/analyze', analyzeResume);

export default router;
