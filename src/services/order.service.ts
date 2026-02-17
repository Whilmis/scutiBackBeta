
import { PaymentMethod, OrderStatus, TransactionType } from '@prisma/client';
import { WalletService } from './wallet.service';
import prisma from '../config/db';
import * as activityService from './activity.service';
import { ActivityType } from '@prisma/client';

export const OrderService = {
    /**
     * Create a new purchase order
     */
    async createOrder(userId: string, courseId: string, method: PaymentMethod, proofUrl?: string) {
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) throw new Error("Course not found");

        // Check if already enrolled
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
        });
        if (existingEnrollment) throw new Error("User already enrolled in this course");

        // Logic based on Method
        if (method === PaymentMethod.COINS) {
            const price = Number(course.price);

            const result = await prisma.$transaction(async (tx) => {
                // 1. Deduct Coins (throws if insufficient)
                const user = await tx.user.findUnique({ where: { id: userId } });
                if (!user || user.coinsBalance < price) {
                    throw new Error("Insufficient coins");
                }

                await tx.user.update({
                    where: { id: userId },
                    data: { coinsBalance: { decrement: price } },
                });

                await tx.coinTransaction.create({
                    data: {
                        userId,
                        amount: -price,
                        type: TransactionType.PURCHASE,
                        description: `Purchase of course: ${course.title}`,
                    }
                });

                // 2. Create Order (Completed)
                const order = await tx.order.create({
                    data: {
                        userId,
                        courseId,
                        amount: course.price,
                        currency: course.currency,
                        method: PaymentMethod.COINS,
                        status: OrderStatus.COMPLETED,
                    }
                });

                // 3. Enroll User
                await tx.enrollment.create({
                    data: {
                        userId,
                        courseId,
                    }
                });

                return order;
            });

            await activityService.logActivity(userId, ActivityType.ENROLLED_COURSE, { courseId });
            return result;

        } else if (method === PaymentMethod.TRANSFER || method === PaymentMethod.CASH) {
            // Create Pending Order
            return prisma.order.create({
                data: {
                    userId,
                    courseId,
                    amount: course.price,
                    currency: course.currency,
                    method,
                    status: OrderStatus.PENDING,
                    proofUrl, // Optional for Cash, required for Transfer usually
                }
            });
        } else if (method === PaymentMethod.STRIPE) {
            // Placeholder for Stripe
            return prisma.order.create({
                data: {
                    userId,
                    courseId,
                    amount: course.price,
                    currency: course.currency,
                    method,
                    status: OrderStatus.PENDING, // Waiting for webhook
                    // stripeIntentId: ... 
                }
            });
        }

        throw new Error("Invalid payment method");
    },

    /**
     * Approve a Transfer/Cash order (Course Creator only)
     */
    async approveOrder(orderId: string, creatorId: string) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { course: true }
        });

        if (!order) throw new Error("Order not found");
        if (order.course.creatorId !== creatorId) throw new Error("Unauthorized: Only the creator can approve");
        if (order.status !== OrderStatus.PENDING) throw new Error("Order is not pending");

        const result = await prisma.$transaction(async (tx) => {
            // 1. Update Order
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: { status: OrderStatus.COMPLETED }
            });

            // 2. Enroll User
            await tx.enrollment.create({
                data: {
                    userId: order.userId,
                    courseId: order.courseId,
                }
            });

            return updatedOrder;
        });

        await activityService.logActivity(order.userId, ActivityType.ENROLLED_COURSE, { courseId: order.courseId });
        return result;
    },

    /**
    * Get orders for a user
    */
    async getUserOrders(userId: string) {
        return prisma.order.findMany({
            where: { userId },
            include: { course: { select: { title: true, coverImage: true } } },
            orderBy: { createdAt: 'desc' }
        });
    },

    /** 
     * Get orders for a course (for creator to manage)
     */
    async getCourseOrders(courseId: string, creatorId: string) {
        // Verify ownership
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course || course.creatorId !== creatorId) throw new Error("Unauthorized");

        return prisma.order.findMany({
            where: { courseId },
            include: { user: { select: { fullName: true, email: true, avatarUrl: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }
};

