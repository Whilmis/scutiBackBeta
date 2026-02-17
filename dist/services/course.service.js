"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishCourse = exports.getCourseById = exports.updateCourse = exports.createCourse = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const createCourse = async (userId, data) => {
    return prisma_1.default.course.create({
        data: {
            ...data,
            creatorId: userId,
            status: 'DRAFT', // Always DRAFT initially
        },
    });
};
exports.createCourse = createCourse;
const updateCourse = async (courseId, userId, data) => {
    // Ensure user owns the course
    const course = await prisma_1.default.course.findUnique({
        where: { id: courseId },
    });
    if (!course || course.creatorId !== userId) {
        throw new Error('Course not found or unauthorized');
    }
    // Handle Decimal conversion if price is present
    const updateData = { ...data };
    if (updateData.price !== undefined) {
        updateData.price = new client_1.Prisma.Decimal(updateData.price);
    }
    // Handle Date conversion if startDate is present
    if (updateData.startDate && typeof updateData.startDate === 'string') {
        updateData.startDate = new Date(updateData.startDate);
    }
    return prisma_1.default.course.update({
        where: { id: courseId },
        data: updateData,
    });
};
exports.updateCourse = updateCourse;
const getCourseById = async (courseId) => {
    return prisma_1.default.course.findUnique({
        where: { id: courseId },
        include: {
            sections: {
                include: {
                    lessons: {
                        orderBy: { order: 'asc' }
                    }
                },
                orderBy: { order: 'asc' }
            },
            creator: {
                select: {
                    id: true,
                    fullName: true,
                    avatarUrl: true,
                }
            },
            skill: true
        },
    });
};
exports.getCourseById = getCourseById;
const publishCourse = async (courseId, userId) => {
    const course = await (0, exports.getCourseById)(courseId);
    if (!course || course.creatorId !== userId) {
        throw new Error('Unauthorized');
    }
    // Validation: Must have at least one section and one lesson
    if (course.sections.length === 0) {
        throw new Error('Course must have at least one section to be published');
    }
    const hasLyrics = course.sections.some((section) => section.lessons.length > 0);
    if (!hasLyrics) {
        throw new Error('Course must have at least one lesson to be published');
    }
    return prisma_1.default.course.update({
        where: { id: courseId },
        data: { status: 'PUBLISHED' },
    });
};
exports.publishCourse = publishCourse;
