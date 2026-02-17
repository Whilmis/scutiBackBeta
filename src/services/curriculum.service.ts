import prisma from '../lib/prisma';

// SECTIONS
export const createSection = async (courseId: string, userId: string, data: { title: string; order: number }) => {
    // Verify ownership
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.creatorId !== userId) throw new Error('Unauthorized');

    return prisma.section.create({
        data: {
            ...data,
            courseId,
        },
    });
};

// LESSONS
export const createLesson = async (sectionId: string, userId: string, data: any) => {
    // Verify ownership by checking section -> course -> creator
    const section = await prisma.section.findUnique({
        where: { id: sectionId },
        include: { course: true }
    });

    if (!section || section.course.creatorId !== userId) throw new Error('Unauthorized');

    return prisma.lesson.create({
        data: {
            ...data,
            sectionId,
        },
    });
};

export const updateLesson = async (lessonId: string, userId: string, data: any) => {
    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { section: { include: { course: true } } }
    });

    if (!lesson || lesson.section.course.creatorId !== userId) throw new Error('Unauthorized');

    return prisma.lesson.update({
        where: { id: lessonId },
        data,
    });
};

export const addMaterial = async (lessonId: string, userId: string, material: any) => {
    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { section: { include: { course: true } } }
    });

    if (!lesson || lesson.section.course.creatorId !== userId) throw new Error('Unauthorized');

    // Handle existing materials
    let currentMaterials: any[] = [];
    if (lesson.materials && Array.isArray(lesson.materials)) {
        currentMaterials = lesson.materials as any[];
    } else if (lesson.materials) {
        // If it exists but not array (legacy or weird state), wrap it
        currentMaterials = [lesson.materials];
    }

    currentMaterials.push(material);

    return prisma.lesson.update({
        where: { id: lessonId },
        data: {
            materials: currentMaterials
        }
    });
};

export const updateSection = async (sectionId: string, userId: string, data: any) => {
    const section = await prisma.section.findUnique({
        where: { id: sectionId },
        include: { course: true }
    });

    if (!section || section.course.creatorId !== userId) throw new Error('Unauthorized');

    return prisma.section.update({
        where: { id: sectionId },
        data
    });
};

export const deleteSection = async (sectionId: string, userId: string) => {
    const section = await prisma.section.findUnique({
        where: { id: sectionId },
        include: { course: true }
    });

    if (!section || section.course.creatorId !== userId) throw new Error('Unauthorized');

    return prisma.section.delete({
        where: { id: sectionId }
    });
};

export const getLesson = async (lessonId: string) => {
    return prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { section: { include: { course: true } } }
    });
};

export const deleteLesson = async (lessonId: string, userId: string) => {
    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { section: { include: { course: true } } }
    });

    if (!lesson || lesson.section.course.creatorId !== userId) throw new Error('Unauthorized');

    return prisma.lesson.delete({
        where: { id: lessonId }
    });
};
