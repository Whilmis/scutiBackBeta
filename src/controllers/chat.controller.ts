
import { Request, Response } from 'express';
import * as chatService from '../services/chat.service';
import { socketService } from '../services/socket.service';

interface AuthRequest extends Request {
    user?: any;
}

export const startConversation = async (req: AuthRequest, res: Response) => {
    try {
        const senderId = req.user.id;
        const { recipientId, courseId } = req.body;

        // Simple 1-on-1 logic
        const conversation = await chatService.createConversation([senderId, recipientId], courseId);
        res.status(201).json(conversation);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getConversations = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const conversations = await chatService.getUserConversations(userId);
        res.status(200).json(conversations);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const senderId = req.user.id;
        const conversationId = req.params.id as string;
        const { content } = req.body;

        const message = await chatService.sendMessage(senderId, conversationId, content);

        // Real-time update
        socketService.emitNewMessage(conversationId, message);

        res.status(201).json(message);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const conversationId = req.params.id as string;
        const messages = await chatService.getConversationMessages(conversationId);
        res.status(200).json(messages);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
