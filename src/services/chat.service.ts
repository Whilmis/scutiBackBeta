
import prisma from '../lib/prisma';

export const createConversation = async (userIds: string[], courseId?: string) => {
    // Check if conversation already exists between these precise users (generic approach)
    // For 2 users, it's simpler. For group chat, it's complex. Let's assume direct messages for now.

    // Create new
    return prisma.conversation.create({
        data: {
            users: {
                connect: userIds.map(id => ({ id }))
            },
            courseId
        },
        include: { users: true }
    });
};

export const getUserConversations = async (userId: string) => {
    return prisma.conversation.findMany({
        where: {
            users: { some: { id: userId } }
        },
        include: {
            users: {
                select: { id: true, fullName: true, avatarUrl: true }
            },
            messages: {
                take: 1,
                orderBy: { createdAt: 'desc' }
            },
            course: {
                select: { id: true, title: true }
            }
        },
        orderBy: { updatedAt: 'desc' }
    });
};

export const sendMessage = async (senderId: string, conversationId: string, content: string) => {
    const message = await prisma.message.create({
        data: {
            senderId,
            conversationId,
            content
        }
    });

    // Update conversation updatedAt
    await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
    });

    return message;
};

export const getConversationMessages = async (conversationId: string) => {
    return prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        include: {
            sender: {
                select: { id: true, fullName: true, avatarUrl: true }
            }
        }
    });
};
