import { Request, Response } from 'express';
import * as aiService from '../services/ai.service';

interface AuthRequest extends Request {
    user?: any;
}

export const getGreeting = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const message = await aiService.generatePersonalizedGreeting(userId);
        res.status(200).json({ reply: message });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const chat = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const { messages } = req.body;

        if (!Array.isArray(messages)) {
            res.status(400).json({ message: "Payload must include a 'messages' array" });
            return;
        }

        const reply = await aiService.chatWithAI(userId, messages);
        res.status(200).json(reply);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
