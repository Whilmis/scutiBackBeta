import { Request, Response } from 'express';
import * as swapService from '../services/swap.service';

interface AuthRequest extends Request {
    user?: any;
}

export const createSwapRequest = async (req: AuthRequest, res: Response) => {
    try {
        const senderId = req.user.id;
        const swap = await swapService.createSwapRequest(senderId, req.body);
        res.status(201).json(swap);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getUserSwaps = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const swaps = await swapService.getUserSwaps(userId);
        res.status(200).json(swaps);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const acceptSwap = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const swapId = req.params.id as string;
        const result = await swapService.acceptSwap(swapId, userId);
        res.status(200).json({ message: 'Swap accepted successfully', swap: result });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const rejectSwap = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const swapId = req.params.id as string;
        const result = await swapService.rejectSwap(swapId, userId);
        res.status(200).json({ message: `Swap ${result.status.toLowerCase()} successfully`, swap: result });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
