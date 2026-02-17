"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLessonSchema = exports.createLessonSchema = exports.createSectionSchema = exports.updateCourseSchema = exports.createCourseSchema = void 0;
const zod_1 = require("zod");
// Enums (matching Prisma)
const SkillCategoryEnum = zod_1.z.enum(['PROGRAMMING', 'DESIGN', 'DATA_SCIENCE', 'MARKETING', 'BUSINESS', 'WELLNESS', 'OTHER']);
const CourseLevelEnum = zod_1.z.enum(['BEGINNER', 'PROFESSIONAL', 'EXPERT']);
const ScheduleTypeEnum = zod_1.z.enum(['AUTO_SCHEDULE', 'FLEXIBLE', 'HYBRID']);
const DeliveryModeEnum = zod_1.z.enum(['ONLINE', 'IN_PERSON', 'HYBRID']);
const CourseStatusEnum = zod_1.z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
const LessonTypeEnum = zod_1.z.enum(['VIDEO', 'LIVE', 'WORKSHOP', 'TEXT']);
// Step 1: Info
exports.createCourseSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(5),
        description: zod_1.z.string().optional(),
        category: SkillCategoryEnum,
        level: CourseLevelEnum.optional(),
        duration: zod_1.z.string().optional(),
        learningOutcomes: zod_1.z.array(zod_1.z.string()).optional(),
        skillId: zod_1.z.string().uuid().optional(), // Related Skill
    }),
});
// Update Course (Steps 1, 3, 4)
exports.updateCourseSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(5).optional(),
        description: zod_1.z.string().optional(),
        category: SkillCategoryEnum.optional(),
        level: CourseLevelEnum.optional(),
        duration: zod_1.z.string().optional(),
        learningOutcomes: zod_1.z.array(zod_1.z.string()).optional(),
        // Step 3: Logistics & Pricing
        isSwapOpen: zod_1.z.boolean().optional(),
        price: zod_1.z.number().min(0).optional(), // Passed as number, handled as Decimal in service
        currency: zod_1.z.string().length(3).optional(),
        scheduleType: ScheduleTypeEnum.optional(),
        startDate: zod_1.z.string().datetime().optional().nullable(), // ISO String
        frequency: zod_1.z.string().optional(), // Added for consistency with UI (e.g. Weekly)
        // New Location Fields
        meetingUrl: zod_1.z.string().url().optional().nullable(),
        address: zod_1.z.string().optional().nullable(),
        latitude: zod_1.z.number().optional().nullable(),
        longitude: zod_1.z.number().optional().nullable(),
        deliveryMode: DeliveryModeEnum.optional(),
        // Step 4: Status / Metadata
        status: CourseStatusEnum.optional(),
        coverImage: zod_1.z.string().url().optional(),
    }),
});
// Sections
exports.createSectionSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1),
        order: zod_1.z.number().int(),
    }),
});
// Lessons
exports.createLessonSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1),
        order: zod_1.z.number().int(),
        type: LessonTypeEnum.optional(), // New field
        // Content
        videoUrl: zod_1.z.string().url().optional(),
        duration: zod_1.z.number().int().optional(),
        summary: zod_1.z.string().optional(),
        // Logistics for non-video lessons
        startDate: zod_1.z.string().datetime().optional().nullable(),
        meetingUrl: zod_1.z.string().url().optional().nullable(),
        address: zod_1.z.string().optional().nullable(),
        latitude: zod_1.z.number().optional().nullable(),
        longitude: zod_1.z.number().optional().nullable(),
        isPublished: zod_1.z.boolean().optional(),
        materials: zod_1.z.any().optional(), // JSON
        keyPoints: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
exports.updateLessonSchema = exports.createLessonSchema.deepPartial();
