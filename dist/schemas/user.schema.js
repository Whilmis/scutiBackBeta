"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSkillsSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
const ExchangeModeEnum = zod_1.z.enum(['MENTORSHIP', 'WORKSHOP', 'COLLABORATION', 'COFFEE_CHAT']);
const IntentionEnum = zod_1.z.enum(['TEACH', 'LEARN']);
const SkillCategoryEnum = zod_1.z.enum(['PROGRAMMING', 'DESIGN', 'DATA_SCIENCE', 'MARKETING', 'BUSINESS', 'WELLNESS', 'OTHER']);
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        headline: zod_1.z.string().optional(),
        bio: zod_1.z.string().optional(),
        yearsOfExp: zod_1.z.number().int().min(0).optional(),
        websiteUrl: zod_1.z.string().url().optional().or(zod_1.z.literal("")),
        avatarUrl: zod_1.z.string().url().optional().or(zod_1.z.literal("")),
        exchangeModes: zod_1.z.array(ExchangeModeEnum).optional(),
    }),
});
exports.addSkillsSchema = zod_1.z.object({
    body: zod_1.z.object({
        skills: zod_1.z.array(zod_1.z.object({
            skillId: zod_1.z.string().uuid().optional(),
            name: zod_1.z.string().optional(),
            category: SkillCategoryEnum.optional(),
            level: zod_1.z.number().int().min(1).max(5),
            intention: IntentionEnum,
        })).min(1),
    }),
});
