import { Request, Response } from 'express';
import * as calendarService from '../services/calendar.service';

interface AuthRequest extends Request {
    user?: any;
}

export const getMyCalendar = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const events = await calendarService.getUserCalendar(userId);
        res.status(200).json(events);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
