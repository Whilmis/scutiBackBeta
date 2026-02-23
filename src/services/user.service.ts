import prisma from '../lib/prisma';
import * as activityService from './activity.service';
import { ActivityType } from '@prisma/client';

export const updateProfile = async (userId: string, data: any) => {
    return prisma.user.update({
        where: { id: userId },
        data: {
            headline: data.headline,
            bio: data.bio,
            yearsOfExp: data.yearsOfExp,
            websiteUrl: data.websiteUrl,
            avatarUrl: data.avatarUrl,
            exchangeModes: data.exchangeModes,
        },
    });
};

export const addSkills = async (userId: string, skillsData: any[]) => {
    const results = [];

    for (const item of skillsData) {
        let skillId = item.skillId;

        if (!skillId && item.name) {
            // Find or Create Skill
            const normalizedName = item.name.trim();

            // Try to find existing first
            const existingSkill = await prisma.skill.findUnique({
                where: { name: normalizedName }
            });

            if (existingSkill) {
                skillId = existingSkill.id;
            } else {
                // Find category by title (item.category) or default to 'Programming' (since we seeded it)
                // TODO: Better default handling
                let catId = item.categoryId;
                if (!catId && item.category) {
                    const cat = await prisma.category.findUnique({ where: { title: item.category } });
                    if (cat) catId = cat.id;
                }

                // Fallback: If no category found, pick one (e.g. first one or specific 'Other')
                if (!catId) {
                    const anyCat = await prisma.category.findFirst();
                    if (anyCat) catId = anyCat.id;
                }

                if (!catId) throw new Error('Cannot create skill: No category found');

                // Create new skill
                const newSkill = await prisma.skill.create({
                    data: {
                        name: normalizedName,
                        categoryId: catId,
                    }
                });
                skillId = newSkill.id;
            }
        }

        if (skillId) {
            // Upsert UserSkill
            const userSkill = await prisma.userSkill.upsert({
                where: {
                    userId_skillId_intention: {
                        userId,
                        skillId,
                        intention: item.intention,
                    }
                },
                update: {
                    level: item.level,
                },
                create: {
                    userId,
                    skillId,
                    level: item.level,
                    intention: item.intention,
                }
            });
            results.push(userSkill);
        }
    }
    return results;
};

export const getUserProfile = async (userId: string, observerId?: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            skills: {
                include: {
                    skill: {
                        include: {
                            category: true
                        }
                    }
                }
            },
            _count: {
                select: { followedBy: true, following: true }
            },
            ...(observerId ? {
                followedBy: {
                    where: { followerId: observerId },
                    take: 1
                }
            } : {})
        }
    });

    if (!user) return null;

    const isFollowing = observerId ? (user as any).followedBy?.length > 0 : false;

    return { ...user, isFollowing };
};

// --- Social Features (Follow System) ---

export const followUser = async (followerId: string, followingId: string) => {
    if (followerId === followingId) throw new Error("You cannot follow yourself");

    const follow = await prisma.follows.create({
        data: {
            followerId,
            followingId
        }
    });

    await activityService.logActivity(followerId, ActivityType.FOLLOWED_USER, { followingId });
    return follow;
};

export const unfollowUser = async (followerId: string, followingId: string) => {
    return prisma.follows.deleteMany({
        where: {
            followerId,
            followingId
        }
    });
};

export const getUserNetwork = async (userId: string, observerId?: string) => {
    const followers = await prisma.follows.findMany({
        where: { followingId: userId },
        include: { follower: { select: { id: true, fullName: true, avatarUrl: true, headline: true } } }
    });

    const following = await prisma.follows.findMany({
        where: { followerId: userId },
        include: { following: { select: { id: true, fullName: true, avatarUrl: true, headline: true } } }
    });

    // Optimization: If observerId exists, fetch who they follow to compute 'isFollowing'
    let myFollowingIds = new Set<string>();
    if (observerId) {
        const myFollows = await prisma.follows.findMany({
            where: { followerId: observerId },
            select: { followingId: true }
        });
        myFollowingIds = new Set(myFollows.map(f => f.followingId));
    }

    return {
        followers: followers.map(f => ({
            ...f.follower,
            isFollowing: myFollowingIds.has(f.followerId)
        })),
        following: following.map(f => ({
            ...f.following,
            isFollowing: myFollowingIds.has(f.followingId)
        })),
        counts: {
            followers: followers.length,
            following: following.length
        }
    };
};
