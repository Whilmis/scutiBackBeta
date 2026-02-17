import { z } from 'zod';

// Enums (matching Prisma)
const SkillCategoryEnum = z.enum(['PROGRAMMING', 'DESIGN', 'DATA_SCIENCE', 'MARKETING', 'BUSINESS', 'WELLNESS', 'OTHER']);
const CourseLevelEnum = z.enum(['BEGINNER', 'PROFESSIONAL', 'EXPERT']);
const ScheduleTypeEnum = z.enum(['AUTO_SCHEDULE', 'FLEXIBLE', 'HYBRID']);
const DeliveryModeEnum = z.enum(['ONLINE', 'IN_PERSON', 'HYBRID']);
const CourseStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
const CourseFormatEnum = z.enum(['SELF_PACED', 'LIVE', 'IN_PERSON', 'HYBRID']);

const LessonTypeEnum = z.enum(['VIDEO', 'LIVE', 'WORKSHOP', 'TEXT']);

// Step 1: Info
export const createCourseSchema = z.object({
    body: z.object({
        title: z.string().min(5),
        description: z.string().optional(),
        categoryId: z.string().uuid(), // Updated from Enum to UUID
        level: CourseLevelEnum.optional(),
        duration: z.string().optional(),
        learningOutcomes: z.array(z.string()).optional(),
        type: CourseFormatEnum.optional(), // Default is HYBRID
        skillId: z.string().uuid().optional(), // Related Skill
    }),
});

// Update Course (Steps 1, 3, 4)
export const updateCourseSchema = z.object({
    body: z.object({
        title: z.string().min(5).optional(),
        description: z.string().optional(),
        categoryId: z.string().uuid().optional(),
        level: CourseLevelEnum.optional(),
        duration: z.string().optional(),
        learningOutcomes: z.array(z.string()).optional(),

        // Step 3: Logistics & Pricing
        isSwapOpen: z.boolean().optional(),
        price: z.number().min(0).optional(), // Passed as number, handled as Decimal in service
        currency: z.string().length(3).optional(),
        scheduleType: ScheduleTypeEnum.optional(),
        startDate: z.string().datetime().optional().nullable(), // ISO String
        frequency: z.string().optional(), // Added for consistency with UI (e.g. Weekly)

        // New Location Fields
        meetingUrl: z.string().url().optional().nullable(),
        address: z.string().optional().nullable(),
        latitude: z.number().optional().nullable(),
        longitude: z.number().optional().nullable(),

        deliveryMode: DeliveryModeEnum.optional(),
        type: CourseFormatEnum.optional(),

        // Step 4: Status / Metadata
        status: CourseStatusEnum.optional(),
        coverImage: z.string().url().optional(),
    }),
});

// Sections
export const createSectionSchema = z.object({
    body: z.object({
        title: z.string().min(1),
        order: z.number().int(),
    }),
});

export const updateSectionSchema = z.object({
    body: z.object({
        title: z.string().min(1).optional(),
        order: z.number().int().optional(),
    }),
});

// Lessons
export const createLessonSchema = z.object({
    body: z.object({
        title: z.string().min(1),
        order: z.number().int(),
        type: LessonTypeEnum.optional(), // New field

        // Content
        videoUrl: z.string().url().optional(),
        duration: z.number().int().optional(),
        summary: z.string().optional(),

        // Logistics for non-video lessons
        startDate: z.string().datetime().optional().nullable(),
        meetingUrl: z.string().url().optional().nullable(),
        address: z.string().optional().nullable(),
        latitude: z.number().optional().nullable(),
        longitude: z.number().optional().nullable(),

        isPublished: z.boolean().optional(),
        materials: z.any().optional(), // JSON
        keyPoints: z.array(z.string()).optional(),
    }),
});

export const updateLessonSchema = createLessonSchema.deepPartial();
