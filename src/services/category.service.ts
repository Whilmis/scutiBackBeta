
import prisma from '../lib/prisma';

export const listCategories = async (search?: string) => {
    const where = search ? {
        title: { contains: search, mode: 'insensitive' as const }
    } : {};

    return prisma.category.findMany({
        where,
        include: {
            skills: true
        }
    });
};

export const createCategory = async (data: any) => {
    return prisma.category.create({
        data
    });
};
