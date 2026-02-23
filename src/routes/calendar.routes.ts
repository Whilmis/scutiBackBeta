import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import * as calendarController from '../controllers/calendar.controller';

const router = Router();

// Protect calendar routes
router.use(authenticate);

router.get('/', calendarController.getMyCalendar);

export default router;
