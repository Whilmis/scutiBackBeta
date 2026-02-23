
import prisma from '../lib/prisma';

export const createConversation = async (userIds: string[], courseId?: string) => {
    // Ensure the array of IDs is always sorted so [sender, recipient] matches [recipient, sender]
    const sortedUserIds = [...userIds].sort();

    // 1. Check if a conversation already exists with EXACTLY these users (and courseId)
    // We expect userIds to be exactly 2 for now, so let's find a conversation that has both.
    const existingConversations = await prisma.conversation.findMany({
        where: {
            AND: sortedUserIds.map(id => ({
                users: { some: { id } }
            })),
            ...(courseId ? { courseId } : { courseId: null })
        },
        include: { users: true }
    });

    // 2. Filter to find one that has exactly the same number of users
    const exactMatch = existingConversations.find(conv => conv.users.length === sortedUserIds.length);

    if (exactMatch) {
        return exactMatch; // Return existing conversation
    }

    // 3. Create new if not found
    return prisma.conversation.create({
        data: {
            users: {
                connect: sortedUserIds.map(id => ({ id }))
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

export const sendMessage = async (senderId: string, conversationId: string, content: string, imageUrl?: string) => {
    const message = await prisma.message.create({
        data: {
            senderId,
            conversationId,
            content,
            imageUrl
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

export const markMessagesAsRead = async (conversationId: string, userId: string) => {
    // Mark all messages as read in this conversation that WERE NOT sent by the current user
    return prisma.message.updateMany({
        where: {
            conversationId,
            senderId: { not: userId },
            isRead: false
        },
        data: {
            isRead: true
        }
    });
};
