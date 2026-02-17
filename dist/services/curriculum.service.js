"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMaterial = exports.updateLesson = exports.createLesson = exports.createSection = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
// SECTIONS
const createSection = async (courseId, userId, data) => {
    // Verify ownership
    const course = await prisma_1.default.course.findUnique({ where: { id: courseId } });
    if (!course || course.creatorId !== userId)
        throw new Error('Unauthorized');
    return prisma_1.default.section.create({
        data: {
            ...data,
            courseId,
        },
    });
};
exports.createSection = createSection;
// LESSONS
const createLesson = async (sectionId, userId, data) => {
    // Verify ownership by checking section -> course -> creator
    const section = await prisma_1.default.section.findUnique({
        where: { id: sectionId },
        include: { course: true }
    });
    if (!section || section.course.creatorId !== userId)
        throw new Error('Unauthorized');
    return prisma_1.default.lesson.create({
        data: {
            ...data,
            sectionId,
        },
    });
};
exports.createLesson = createLesson;
const updateLesson = async (lessonId, userId, data) => {
    const lesson = await prisma_1.default.lesson.findUnique({
        where: { id: lessonId },
        include: { section: { include: { course: true } } }
    });
    if (!lesson || lesson.section.course.creatorId !== userId)
        throw new Error('Unauthorized');
    return prisma_1.default.lesson.update({
        where: { id: lessonId },
        data,
    });
};
exports.updateLesson = updateLesson;
const addMaterial = async (lessonId, userId, material) => {
    const lesson = await prisma_1.default.lesson.findUnique({
        where: { id: lessonId },
        include: { section: { include: { course: true } } }
    });
    if (!lesson || lesson.section.course.creatorId !== userId)
        throw new Error('Unauthorized');
    // Handle existing materials
    let currentMaterials = [];
    if (lesson.materials && Array.isArray(lesson.materials)) {
        currentMaterials = lesson.materials;
    }
    else if (lesson.materials) {
        // If it exists but not array (legacy or weird state), wrap it
        currentMaterials = [lesson.materials];
    }
    currentMaterials.push(material);
    return prisma_1.default.lesson.update({
        where: { id: lessonId },
        data: {
            materials: currentMaterials
        }
    });
};
exports.addMaterial = addMaterial;
