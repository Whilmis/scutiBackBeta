import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest';
import * as swapController from '../controllers/swap.controller';
import { createSwapSchema } from '../schemas/swap.schema';

const router = Router();

// Protect all swap routes
router.use(authenticate);

router.post('/', validateRequest(createSwapSchema), swapController.createSwapRequest);
router.get('/', swapController.getUserSwaps); // Merge of sent/received via service
router.patch('/:id/accept', swapController.acceptSwap);
router.patch('/:id/reject', swapController.rejectSwap); // Also serves to cancel if sender

export default router;
