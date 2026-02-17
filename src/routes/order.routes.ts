
import { Router } from 'express';
import { createOrder, approveOrder, getMyOrders, getCourseOrders } from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware'; // Fixed import path

import { uploadPaymentProof } from '../middlewares/upload.middleware';

const router = Router();

router.post('/', authenticate, uploadPaymentProof.single('proof'), createOrder);
router.patch('/:orderId/approve', authenticate, approveOrder);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/course/:courseId', authenticate, getCourseOrders);

export default router;
