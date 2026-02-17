
import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import * as feedController from '../controllers/feed.controller';
import { validateRequest } from '../middlewares/validateRequest';
// TODO: Add schema validation for createPost

const router = Router();

router.use(authenticate);

router.post('/', feedController.createPost);
router.get('/', feedController.getFeed); // ?type=global|following
router.post('/:id/like', feedController.likePost);
router.post('/:id/comments', feedController.addComment);

export default router;
