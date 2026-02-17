import { Request, Response } from 'express';
import * as courseService from '../services/course.service';

interface AuthRequest extends Request {
    user?: any;
}

export const createCourse = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const course = await courseService.createCourse(userId, req.body);
        res.status(201).json(course);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateCourse = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const courseId = req.params.id as string;
        const course = await courseService.updateCourse(courseId, userId, req.body);
        res.status(200).json(course);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getCourse = async (req: Request, res: Response) => {
    try {
        const course = await courseService.getCourseById(req.params.id as string);
        if (!course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }
        res.status(200).json(course);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const publishCourse = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const courseId = req.params.id as string;
        const course = await courseService.publishCourse(courseId, userId);
        res.status(200).json(course);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const uploadCoverImage = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        const userId = req.user.id;
        const courseId = req.params.id as string;
        // @ts-ignore
        const location = req.file.location;

        const course = await courseService.updateCourse(courseId, userId, { coverImage: location });
        res.status(200).json({
            message: 'Cover image updated successfully',
            coverImage: course.coverImage
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const listCourses = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const courses = await courseService.listCourses(userId);
        res.status(200).json(courses);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const searchCourses = async (req: Request, res: Response) => {
    console.log('Search endpoint hit:', req.query);
    try {
        const filters = {
            q: req.query.q as string,
            categoryId: req.query.categoryId as string,
            skillId: req.query.skillId as string,
            level: req.query.level,
            type: req.query.mode, // 'mode' in query params maps to 'type' in service/db
            minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
            maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
            lat: req.query.lat ? Number(req.query.lat) : undefined,
            lng: req.query.lng ? Number(req.query.lng) : undefined,
            radius: req.query.radius ? Number(req.query.radius) : undefined,
            sort: req.query.sort as string,
            page: req.query.page ? Number(req.query.page) : 1,
            limit: req.query.limit ? Number(req.query.limit) : 10,
        };

        const result = await courseService.searchCourses(filters);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCourse = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const courseId = req.params.id as string;
        await courseService.deleteCourse(courseId, userId);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const listEnrolledCourses = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const courses = await courseService.getEnrolledCourses(userId);
        res.status(200).json(courses);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
