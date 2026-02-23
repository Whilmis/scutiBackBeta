import prisma from '../lib/prisma';
import * as courseService from './course.service';
import * as chatService from './chat.service';
import { socketService } from './socket.service';

export const createSwapRequest = async (senderId: string, data: any) => {
    const { receiverId, offeredCourseId, requestedCourseId, message } = data;

    // Validation 1: Check if Sender actually owns the offered course
    const offeredCourse = await prisma.course.findUnique({ where: { id: offeredCourseId } });
    if (!offeredCourse || offeredCourse.creatorId !== senderId) {
        throw new Error('You do not own the offered course');
    }

    // Validation 2: Check if Receiver actually owns the requested course
    const requestedCourse = await prisma.course.findUnique({ where: { id: requestedCourseId } });
    if (!requestedCourse || requestedCourse.creatorId !== receiverId) {
        throw new Error('The receiver does not own the requested course');
    }

    // Validation 3: Prevent duplicate pending swaps between the same exact courses
    const existingSwap = await prisma.swapRequest.findFirst({
        where: {
            senderId,
            receiverId,
            offeredCourseId,
            requestedCourseId,
            status: 'PENDING'
        }
    });

    if (existingSwap) {
        throw new Error('A pending swap request for these courses already exists');
    }

    const swap = await prisma.swapRequest.create({
        data: {
            senderId,
            receiverId,
            offeredCourseId,
            requestedCourseId,
            message
        },
        include: {
            sender: { select: { id: true, fullName: true, avatarUrl: true } },
            receiver: { select: { id: true, fullName: true, avatarUrl: true } },
            offeredCourse: { select: { id: true, title: true, coverImage: true } },
            requestedCourse: { select: { id: true, title: true, coverImage: true } }
        }
    });

    // Notify via Chat
    try {
        const conversation = await chatService.createConversation([senderId, receiverId]);
        const messageText = `👋 I have proposed a Course Swap! I am offering my course for your course. Check your Swap Inbox to review the details.`;
        const chatMsg = await chatService.sendMessage(senderId, conversation.id, messageText);
        socketService.emitNewMessage(conversation.id, chatMsg);
    } catch (e) {
        console.error('Failed to send swap proposal chat notification', e);
    }

    return swap;
};

export const getUserSwaps = async (userId: string) => {
    // Get swaps where user is either sender or receiver
    return prisma.swapRequest.findMany({
        where: {
            OR: [
                { senderId: userId },
                { receiverId: userId }
            ]
        },
        include: {
            sender: { select: { id: true, fullName: true, avatarUrl: true } },
            receiver: { select: { id: true, fullName: true, avatarUrl: true } },
            offeredCourse: { select: { id: true, title: true, coverImage: true } },
            requestedCourse: { select: { id: true, title: true, coverImage: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};

export const getSwapById = async (swapId: string, userId: string) => {
    const swap = await prisma.swapRequest.findUnique({
        where: { id: swapId },
        include: {
            sender: { select: { id: true, fullName: true, avatarUrl: true } },
            receiver: { select: { id: true, fullName: true, avatarUrl: true } },
            offeredCourse: { select: { id: true, title: true, coverImage: true, _count: { select: { sections: true } } } },
            requestedCourse: { select: { id: true, title: true, coverImage: true, _count: { select: { sections: true } } } }
        }
    });

    if (!swap || (swap.senderId !== userId && swap.receiverId !== userId)) {
        throw new Error('Swap not found or unauthorized');
    }

    return swap;
};

export const acceptSwap = async (swapId: string, userId: string) => {
    const swap = await prisma.swapRequest.findUnique({
        where: { id: swapId }
    });

    if (!swap || swap.receiverId !== userId) {
        throw new Error('Swap not found or unauthorized to accept');
    }

    if (swap.status !== 'PENDING') {
        throw new Error(`Cannot accept a swap that is ${swap.status}`);
    }

    // 1. Update Swap status
    const acceptedSwap = await prisma.swapRequest.update({
        where: { id: swapId },
        data: { status: 'ACCEPTED' },
    });

    // 2. Automate mutual Enrollments conceptually
    // senderId gets access to requestedCourseId
    await prisma.enrollment.upsert({
        where: {
            userId_courseId: {
                userId: swap.senderId,
                courseId: swap.requestedCourseId
            }
        },
        update: {}, // Do nothing if already enrolled somehow
        create: {
            userId: swap.senderId,
            courseId: swap.requestedCourseId,
            progress: 0
        }
    });

    // receiverId gets access to offeredCourseId
    await prisma.enrollment.upsert({
        where: {
            userId_courseId: {
                userId: swap.receiverId,
                courseId: swap.offeredCourseId
            }
        },
        update: {},
        create: {
            userId: swap.receiverId,
            courseId: swap.offeredCourseId,
            progress: 0
        }
    });

    // Notify via Chat
    try {
        const conversation = await chatService.createConversation([swap.senderId, swap.receiverId]);
        const messageText = `✅ I have accepted your Swap proposal! We now have access to each other's courses. Happy learning!`;
        // Receiver is the one accepting the swap, so they send the message
        const chatMsg = await chatService.sendMessage(swap.receiverId, conversation.id, messageText);
        socketService.emitNewMessage(conversation.id, chatMsg);
    } catch (e) {
        console.error('Failed to send accept swap chat notification', e);
    }

    return acceptedSwap;
};

export const rejectSwap = async (swapId: string, userId: string) => {
    const swap = await prisma.swapRequest.findUnique({
        where: { id: swapId }
    });

    // Both sender (to cancel) and receiver (to reject) can perform this
    if (!swap || (swap.receiverId !== userId && swap.senderId !== userId)) {
        throw new Error('Swap not found or unauthorized');
    }

    if (swap.status !== 'PENDING') {
        throw new Error(`Cannot modify a swap that is ${swap.status}`);
    }

    const newStatus = swap.senderId === userId ? 'CANCELLED' : 'REJECTED';

    const updatedSwap = await prisma.swapRequest.update({
        where: { id: swapId },
        data: { status: newStatus },
    });

    // Notify via Chat if rejected
    if (newStatus === 'REJECTED') {
        try {
            const conversation = await chatService.createConversation([swap.senderId, swap.receiverId]);
            const messageText = `❌ I have declined your Swap proposal. Thank you anyway!`;
            // Receiver is the one rejecting
            const chatMsg = await chatService.sendMessage(swap.receiverId, conversation.id, messageText);
            socketService.emitNewMessage(conversation.id, chatMsg);
        } catch (e) {
            console.error('Failed to send reject swap chat notification', e);
        }
    }

    return updatedSwap;
};
