import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import * as activityService from '../services/activity.service';


interface AuthRequest extends Request {
    user?: any; // In real app, define proper User interface
}

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const user = await userService.updateProfile(userId, req.body);
        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                headline: user.headline,
                bio: user.bio,
                yearsOfExp: user.yearsOfExp,
                exchangeModes: user.exchangeModes
            }
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const addSkills = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const skills = await userService.addSkills(userId, req.body.skills);
        res.status(200).json({
            message: 'Skills added successfully',
            count: skills.length,
            skills
        });
    } catch (error: any) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

export const updateAvatar = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        const userId = req.user.id;
        // multer-s3 uses 'location' for the URL, cloudinary uses 'path'
        const avatarUrl = (req.file as any).location || req.file.path;
        const result = await userService.updateProfile(userId, { avatarUrl: avatarUrl });

        res.status(200).json({
            message: 'Avatar updated successfully',
            avatarUrl: result.avatarUrl
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const user = await userService.getUserProfile(userId);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const userAny = user as any;
        const response = {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            headline: user.headline || undefined,
            bio: user.bio || undefined,
            avatarUrl: user.avatarUrl || undefined,
            yearsOfExp: user.yearsOfExp,
            websiteUrl: user.websiteUrl || undefined,
            exchangeModes: user.exchangeModes,
            skills: userAny.skills.map((us: any) => ({
                level: us.level,
                intention: us.intention,
                skill: {
                    name: us.skill.name,
                    category: us.skill.category?.title || 'Other'
                }
            })),
            _count: {
                followers: userAny._count.followedBy,
                following: userAny._count.following
            }
        };

        res.status(200).json(response);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const followUser = async (req: AuthRequest, res: Response) => {
    try {
        const followerId = req.user.id;
        const followingId = req.params.id as string; // The user to follow
        await userService.followUser(followerId, followingId);
        res.status(200).json({ message: 'User followed successfully' });
    } catch (error: any) {
        // Handle unique constraint violation (already following) gracefully
        if ((error as any).code === 'P2002') {
            res.status(200).json({ message: 'Already following this user' });
            return;
        }
        res.status(400).json({ message: error.message });
    }
};

export const unfollowUser = async (req: AuthRequest, res: Response) => {
    try {
        const followerId = req.user.id;
        const followingId = req.params.id as string;
        await userService.unfollowUser(followerId, followingId);
        res.status(200).json({ message: 'User unfollowed successfully' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getNetwork = async (req: AuthRequest, res: Response) => {
    try {
        const userId = (req.params.id as string) || req.user.id; // Can view own or others
        const observerId = req.user.id;
        const network = await userService.getUserNetwork(userId, observerId);
        res.status(200).json(network);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getActivity = async (req: AuthRequest, res: Response) => {
    try {
        const userId = (req.params.id as string) || req.user.id;
        const activities = await activityService.getUserActivity(userId);
        res.status(200).json(activities);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getPublicProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.params.id as string;
        const observerId = req.user?.id;

        const user = await userService.getUserProfile(userId, observerId);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Return public info only
        const userAny = user as any;
        const response = {
            id: user.id,
            fullName: user.fullName,
            headline: user.headline || undefined,
            bio: user.bio || undefined,
            avatarUrl: user.avatarUrl || undefined,
            websiteUrl: user.websiteUrl || undefined,
            skills: userAny.skills.map((us: any) => ({
                level: us.level,
                intention: us.intention,
                skill: {
                    name: us.skill.name,
                    category: us.skill.category?.title || 'Other'
                }
            })),
            _count: {
                followers: userAny._count.followedBy,
                following: userAny._count.following
            },
            isFollowing: user.isFollowing
        };

        res.status(200).json(response);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
