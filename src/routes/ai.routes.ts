import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import * as aiController from '../controllers/ai.controller';

const router = Router();

// Secure AI routes natively
router.use(authenticate);

router.get('/greeting', aiController.getGreeting);
router.post('/chat', aiController.chat);

export default router;
