import { Router } from 'express';
import { getSystemHealth, ping } from '../controllers/health.controller.js';

const router = Router();

router.get('/', getSystemHealth);
router.get('/ping', ping);

export default router;
