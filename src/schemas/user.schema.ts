import { z } from 'zod';

const ExchangeModeEnum = z.enum(['MENTORSHIP', 'WORKSHOP', 'COLLABORATION', 'COFFEE_CHAT']);
const IntentionEnum = z.enum(['TEACH', 'LEARN']);
const SkillCategoryEnum = z.enum(['PROGRAMMING', 'DESIGN', 'DATA_SCIENCE', 'MARKETING', 'BUSINESS', 'WELLNESS', 'OTHER']);

export const updateProfileSchema = z.object({
    body: z.object({
        headline: z.string().optional(),
        bio: z.string().optional(),
        yearsOfExp: z.number().int().min(0).optional(),
        websiteUrl: z.string().url().optional().or(z.literal("")),
        avatarUrl: z.string().url().optional().or(z.literal("")),
        exchangeModes: z.array(ExchangeModeEnum).optional(),
    }),
});

export const addSkillsSchema = z.object({
    body: z.object({
        skills: z.array(z.object({
            skillId: z.string().uuid().optional(),
            name: z.string().optional(),
            category: SkillCategoryEnum.optional(),
            level: z.number().int().min(1).max(5),
            intention: IntentionEnum,
        })).min(1),
    }),
});
