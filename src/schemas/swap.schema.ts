import { z } from 'zod';

export const createSwapSchema = z.object({
    body: z.object({
        receiverId: z.string().uuid({ message: "Invalid receiver ID" }),
        offeredCourseId: z.string().uuid({ message: "Invalid offered course ID" }),
        requestedCourseId: z.string().uuid({ message: "Invalid requested course ID" }),
        message: z.string().optional(),
    }),
});
