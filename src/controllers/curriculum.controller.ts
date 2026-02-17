import { Request, Response } from 'express';
import * as curriculumService from '../services/curriculum.service';

interface AuthRequest extends Request {
    user?: any;
}

export const addSection = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const courseId = req.params.courseId as string;
        const section = await curriculumService.createSection(courseId, userId, req.body);
        res.status(201).json(section);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const addLesson = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const sectionId = req.params.sectionId as string;
        const lesson = await curriculumService.createLesson(sectionId, userId, req.body);
        res.status(201).json(lesson);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateLesson = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const id = req.params.id as string;
        const lesson = await curriculumService.updateLesson(id, userId, req.body);
        res.status(200).json(lesson);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const uploadLessonVideo = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        const userId = req.user.id;
        const id = req.params.id as string;
        // @ts-ignore
        const location = req.file.location;

        const lesson = await curriculumService.updateLesson(id, userId, { videoUrl: location });
        res.status(200).json({
            message: 'Video uploaded successfully',
            videoUrl: lesson.videoUrl
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const uploadLessonMaterial = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        const userId = req.user.id;
        const id = req.params.id as string;
        // @ts-ignore
        const location = req.file.location;
        const originalName = req.file.originalname;

        // Fetch existing materials to append
        // Getting service logic here is a bit tricky without `getLesson`, 
        // ideally service should handle append. Use updateLesson for now, 
        // but note this overwrites if logic isn't careful.
        // For simplicity, we assume we update the materials array logic in service or passed here.
        // Actually, let's create a specific service method for appending material OR 
        // just treating generic update. Since `materials` is JSON, we should probably append.

        // Let's rely on a helper or just replacing logic for now as requested by user flow.
        // But better: append to existing JSON.

        // Simple implementation: Return the url for the frontend to append and save? 
        // No, backend should handle.

        // Let's just save it as a new resource structure
        const newMaterial = {
            name: originalName,
            url: location,
            type: req.file.mimetype === 'application/pdf' ? 'PDF' : 'ZIP'
        };

        // NOTE: This implementation assumes we are appending to a JSON array. 
        // Ideally we fetch, append, save. But to keep controller thin, we might just pass
        // a special payload or let the frontend coordinate via updateLesson.
        // Users asked for "upload file", usually implies saving it.

        // I will implement a specific service method for this in NEXT step if needed, 
        // For now, I will create `addMaterial` in curriculum.service.ts

        const lesson = await curriculumService.addMaterial(id, userId, newMaterial);

        res.status(200).json({
            message: 'Material uploaded successfully',
            materials: lesson.materials
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSection = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const id = req.params.id as string;
        const section = await curriculumService.updateSection(id, userId, req.body);
        res.status(200).json(section);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteSection = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const id = req.params.id as string;
        await curriculumService.deleteSection(id, userId);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getLesson = async (req: Request, res: Response) => {
    try {
        // TODO: Add auth check if lesson is draft or belongs to enrollment
        // For now allowing fetch if ID is known (simplification for Creator flow)
        const lesson = await curriculumService.getLesson(req.params.id as string);
        if (!lesson) {
            res.status(404).json({ message: 'Lesson not found' });
            return;
        }
        res.status(200).json(lesson);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteLesson = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const id = req.params.id as string;
        await curriculumService.deleteLesson(id, userId);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
