"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.addSkills = exports.updateProfile = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const updateProfile = async (userId, data) => {
    return prisma_1.default.user.update({
        where: { id: userId },
        data: {
            headline: data.headline,
            bio: data.bio,
            yearsOfExp: data.yearsOfExp,
            websiteUrl: data.websiteUrl,
            avatarUrl: data.avatarUrl,
            exchangeModes: data.exchangeModes,
        },
    });
};
exports.updateProfile = updateProfile;
const addSkills = async (userId, skillsData) => {
    const results = [];
    for (const item of skillsData) {
        let skillId = item.skillId;
        if (!skillId && item.name) {
            // Find or Create Skill
            const normalizedName = item.name.trim();
            // Try to find existing first
            const existingSkill = await prisma_1.default.skill.findUnique({
                where: { name: normalizedName }
            });
            if (existingSkill) {
                skillId = existingSkill.id;
            }
            else {
                // Create new skill
                const newSkill = await prisma_1.default.skill.create({
                    data: {
                        name: normalizedName,
                        category: item.category || 'OTHER',
                    }
                });
                skillId = newSkill.id;
            }
        }
        if (skillId) {
            // Upsert UserSkill
            const userSkill = await prisma_1.default.userSkill.upsert({
                where: {
                    userId_skillId_intention: {
                        userId,
                        skillId,
                        intention: item.intention,
                    }
                },
                update: {
                    level: item.level,
                },
                create: {
                    userId,
                    skillId,
                    level: item.level,
                    intention: item.intention,
                }
            });
            results.push(userSkill);
        }
    }
    return results;
};
exports.addSkills = addSkills;
const getUserProfile = async (userId) => {
    return prisma_1.default.user.findUnique({
        where: { id: userId },
        include: {
            skills: {
                include: {
                    skill: true
                }
            }
        }
    });
};
exports.getUserProfile = getUserProfile;
