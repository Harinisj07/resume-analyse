import { Router } from 'express';
import healthRoutes from './health.routes.js';
import aiRoutes from './ai.routes.js';
import authRoutes from './auth.routes.js';
import resumeRoutes from './resume.routes.js';
import careerRoutes from './career.routes.js';

import roleRoutes from './role.routes.js';
import userRoutes from './user.routes.js';
import skillGapRoutes from './skillGap.routes.js';
import careerReadinessRoutes from './careerReadiness.routes.js';
import roadmapRoutes from './roadmap.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/ai', aiRoutes);
router.use('/auth', authRoutes);
router.use('/resumes', resumeRoutes);
router.use('/resume', resumeRoutes);
router.use('/career', careerRoutes);
router.use('/roles', roleRoutes);
router.use('/users', userRoutes);
router.use('/skill-gap', skillGapRoutes);
router.use('/career-readiness', careerReadinessRoutes);
router.use('/roadmap', roadmapRoutes);

export default router;

