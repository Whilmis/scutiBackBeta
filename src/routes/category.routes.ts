
import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';

const router = Router();

// Public routes (for viewing expertise)
router.get('/', categoryController.listCategories);
router.get('/skills', categoryController.listSkills);

// Protected routes (TODO: Add Auth if needed, for now public for testing as requested)
router.post('/', categoryController.createCategory);
router.post('/skills', categoryController.createSkill);

export default router;
