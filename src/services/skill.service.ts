
import prisma from '../lib/prisma';

export const createSkill = async (data: any) => {
    return prisma.skill.create({
        data
    });
};

export const listSkills = async (search?: string) => {
    const where = search ? {
        name: { contains: search, mode: 'insensitive' as const }
    } : {};

    return prisma.skill.findMany({
        where,
        include: {
            category: true
        },
        take: 20 // Limit results for search
    });
};
