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
exports.uploadCoverImage = exports.publishCourse = exports.getCourse = exports.updateCourse = exports.createCourse = void 0;
const courseService = __importStar(require("../services/course.service"));
const createCourse = async (req, res) => {
    try {
        const userId = req.user.id;
        const course = await courseService.createCourse(userId, req.body);
        res.status(201).json(course);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.createCourse = createCourse;
const updateCourse = async (req, res) => {
    try {
        const userId = req.user.id;
        const courseId = req.params.id;
        const course = await courseService.updateCourse(courseId, userId, req.body);
        res.status(200).json(course);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updateCourse = updateCourse;
const getCourse = async (req, res) => {
    try {
        const course = await courseService.getCourseById(req.params.id);
        if (!course) {
            res.status(404).json({ message: 'Course not found' });
            return;
        }
        res.status(200).json(course);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.getCourse = getCourse;
const publishCourse = async (req, res) => {
    try {
        const userId = req.user.id;
        const courseId = req.params.id;
        const course = await courseService.publishCourse(courseId, userId);
        res.status(200).json(course);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.publishCourse = publishCourse;
const uploadCoverImage = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }
        const userId = req.user.id;
        const courseId = req.params.id;
        // @ts-ignore
        const location = req.file.location;
        const course = await courseService.updateCourse(courseId, userId, { coverImage: location });
        res.status(200).json({
            message: 'Cover image updated successfully',
            coverImage: course.coverImage
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.uploadCoverImage = uploadCoverImage;
