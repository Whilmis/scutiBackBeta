
import prisma from '../lib/prisma';
import { ActivityType } from '@prisma/client';

export const logActivity = async (userId: string, type: ActivityType, metadata: any = {}) => {
    try {
        await prisma.activityLog.create({
            data: {
                userId,
                type,
                metadata
            }
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
        // Do not throw error to avoid blocking main flow
    }
};

export const getUserActivity = async (userId: string) => {
    return prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20
    });
};
