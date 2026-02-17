
import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { PaymentMethod } from '@prisma/client';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id; // Assuming Auth Middleware populates this
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { courseId, method } = req.body;
        let proofUrl = req.body.proofUrl;

        if (req.file) {
            proofUrl = (req.file as any).location || (req.file as any).path;
        }

        if (!Object.values(PaymentMethod).includes(method)) {
            res.status(400).json({ message: "Invalid payment method" });
            return;
        }

        const order = await OrderService.createOrder(userId, courseId, method, proofUrl);
        res.status(201).json(order);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const approveOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { orderId } = req.params;

        const order = await OrderService.approveOrder(orderId as string, userId);
        res.json(order);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const orders = await OrderService.getUserOrders(userId);
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getCourseOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const { courseId } = req.params;
        const orders = await OrderService.getCourseOrders(courseId as string, userId);
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
