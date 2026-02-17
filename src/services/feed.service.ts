
import prisma from '../lib/prisma';
import { PostType } from '@prisma/client';

import * as activityService from './activity.service';
import { ActivityType } from '@prisma/client';

// Create a Post
export const createPost = async (userId: string, data: any) => {
    const post = await prisma.post.create({
        data: {
            authorId: userId,
            content: data.content,
            mediaUrl: data.mediaUrl,
            type: data.type || PostType.TEXT,
            courseId: data.courseId,
            categoryId: data.categoryId,
            skillId: data.skillId,
            sharedPostId: data.sharedPostId
        },
        include: {
            author: {
                select: { id: true, fullName: true, avatarUrl: true, headline: true }
            },
            sharedPost: {
                include: {
                    author: { select: { id: true, fullName: true, avatarUrl: true } }
                }
            }
        }
    });

    await activityService.logActivity(userId, ActivityType.CREATED_POST, { postId: post.id });
    return post;
};

// Get Global Feed (Trending, etc.)
export const getGlobalFeed = async (filters: any = {}) => {
    const where: any = {};

    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.skillId) where.skillId = filters.skillId;
    // Add logic for 'trending' (e.g. sort by viewCount) vs 'latest'

    return prisma.post.findMany({
        where,
        orderBy: filters.sort === 'trending'
            ? { viewCount: 'desc' }
            : { createdAt: 'desc' },
        take: 20,
        include: {
            author: { select: { id: true, fullName: true, avatarUrl: true, headline: true } },
            course: { select: { id: true, title: true, coverImage: true } },
            _count: { select: { likes: true, comments: true, shares: true } },
            likes: { where: { userId: filters.currentUserId }, select: { userId: true } } // To check if current user liked
        }
    });
};

// Get User Feed (Posts from people I follow)
export const getFollowingFeed = async (userId: string) => {
    const following = await prisma.follows.findMany({
        where: { followerId: userId },
        select: { followingId: true }
    });

    const followingIds = following.map(f => f.followingId);
    followingIds.push(userId); // Include my own posts?

    return prisma.post.findMany({
        where: {
            authorId: { in: followingIds }
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
            author: { select: { id: true, fullName: true, avatarUrl: true, headline: true } },
            course: { select: { id: true, title: true, coverImage: true } },
            _count: { select: { likes: true, comments: true, shares: true } },
            likes: { where: { userId }, select: { userId: true } }
        }
    });
};

export const likePost = async (userId: string, postId: string) => {
    // Check if already liked
    const existing = await prisma.like.findUnique({
        where: { postId_userId: { postId, userId } }
    });

    if (existing) {
        // Unlike
        await prisma.like.delete({
            where: { postId_userId: { postId, userId } }
        });
        await prisma.post.update({ where: { id: postId }, data: { likeCount: { decrement: 1 } } });
        return { liked: false };
    } else {
        // Like
        await prisma.like.create({
            data: { postId, userId }
        });
        await prisma.post.update({ where: { id: postId }, data: { likeCount: { increment: 1 } } });
        return { liked: true };
    }
};

export const addComment = async (userId: string, postId: string, content: string) => {
    const comment = await prisma.comment.create({
        data: {
            authorId: userId,
            postId,
            content
        },
        include: {
            author: { select: { id: true, fullName: true, avatarUrl: true } }
        }
    });

    await prisma.post.update({ where: { id: postId }, data: { commentCount: { increment: 1 } } });
    return comment;
};
