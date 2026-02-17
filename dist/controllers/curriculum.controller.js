"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLessonMaterial = exports.uploadLessonVideo = exports.updateLesson = exports.addLesson = exports.addSection = void 0;
const curriculumService = __importStar(require("../services/curriculum.service"));
const addSection = async (req, res) => {
    try {
        const userId = req.user.id;
        const courseId = req.params.courseId;
        const section = await curriculumService.createSection(courseId, userId, req.body);
        res.status(201).json(section);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.addSection = addSection;
const addLesson = async (req, res) => {
    try {
        const userId = req.user.id;
        const sectionId = req.params.sectionId;
        const lesson = await curriculumService.createLesson(sectionId, userId, req.body);
        res.status(201).json(lesson);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.addLesson = addLesson;
const updateLesson = async (req, res) => {
    try {
        const userId = req.user.id;
        const id = req.params.id;
        const lesson = await curriculumService.updateLesson(id, userId, req.body);
        res.status(200).json(lesson);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updateLesson = updateLesson;
const uploadLessonVideo = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }
        const userId = req.user.id;
        const id = req.params.id;
        // @ts-ignore
        const location = req.file.location;
        const lesson = await curriculumService.updateLesson(id, userId, { videoUrl: location });
        res.status(200).json({
            message: 'Video uploaded successfully',
            videoUrl: lesson.videoUrl
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.uploadLessonVideo = uploadLessonVideo;
const uploadLessonMaterial = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }
        const userId = req.user.id;
        const id = req.params.id;
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.uploadLessonMaterial = uploadLessonMaterial;
