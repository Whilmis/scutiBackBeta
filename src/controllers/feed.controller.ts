
import { Request, Response } from 'express';
import * as feedService from '../services/feed.service';

interface AuthRequest extends Request {
    user?: any;
}

export const createPost = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const post = await feedService.createPost(userId, req.body);
        res.status(201).json(post);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getFeed = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const { type, categoryId, skillId, sort } = req.query; // type = 'following' | 'global'

        let posts;
        if (type === 'following') {
            posts = await feedService.getFollowingFeed(userId);
        } else {
            posts = await feedService.getGlobalFeed({
                categoryId: categoryId as string,
                skillId: skillId as string,
                sort: sort as string,
                currentUserId: userId
            });
        }
        res.status(200).json(posts);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const likePost = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const postId = req.params.id as string;
        const result = await feedService.likePost(userId, postId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const addComment = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const postId = req.params.id as string;
        const { content } = req.body;
        const comment = await feedService.addComment(userId, postId, content);
        res.status(201).json(comment);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
