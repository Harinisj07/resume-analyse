import { Router } from 'express';
import { getRoles, getRoleById, getRoleCategories } from '../controllers/role.controller.js';

const router = Router();

// Retrieve all role categories
router.get('/categories', getRoleCategories);

// Retrieve all roles with query filters (search, category, skill)
router.get('/', getRoles);

// Retrieve single role by ID or name
router.get('/:id', getRoleById);

export default router;
