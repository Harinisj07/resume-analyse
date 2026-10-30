import { Router } from 'express';
import { updateTargetRole, getTargetRole } from '../controllers/user.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Set user target role
router.put('/target-role', optionalAuth, updateTargetRole);

// Get current user target role
router.get('/target-role', optionalAuth, getTargetRole);

export default router;
