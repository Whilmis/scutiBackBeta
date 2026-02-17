import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
    try {
        const { user, token } = await authService.registerUser(req.body);
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
            },
            token,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { user, token } = await authService.loginUser(req.body);
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
            },
            token,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
