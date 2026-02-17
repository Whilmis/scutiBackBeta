
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import * as chatController from '../controllers/chat.controller';

const router = Router();

router.use(authenticate);

router.post('/', chatController.startConversation); // Start chat
router.get('/', chatController.getConversations);   // List chats
router.post('/:id/messages', chatController.sendMessage); // Send msg
router.get('/:id/messages', chatController.getMessages);  // Get history

export default router;
