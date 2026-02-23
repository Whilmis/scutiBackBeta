
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import * as chatController from '../controllers/chat.controller';
import { uploadChatImage } from '../middlewares/upload.middleware';

const router = Router();

router.use(authenticate);

router.post('/', chatController.startConversation); // Start chat
router.get('/', chatController.getConversations);   // List chats
router.post('/:id/messages', chatController.sendMessage); // Send msg
router.get('/:id/messages', chatController.getMessages);  // Get history
router.patch('/:id/read', chatController.markAsRead);     // Mark as read

router.post('/upload-image', uploadChatImage.single('image'), chatController.uploadImage);

export default router;
