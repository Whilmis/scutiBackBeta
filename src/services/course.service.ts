import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export const createCourse = async (userId: string, data: any) => {
    return prisma.course.create({
        data: {
            ...data,
            creatorId: userId,
            status: 'DRAFT', // Always DRAFT initially
        },
    });
};

export const updateCourse = async (courseId: string, userId: string, data: any) => {
    // Ensure user owns the course
    const course = await prisma.course.findUnique({
        where: { id: courseId },
    });

    if (!course || course.creatorId !== userId) {
        throw new Error('Course not found or unauthorized');
    }

    // Handle Decimal conversion if price is present
    const updateData = { ...data };
    if (updateData.price !== undefined) {
        updateData.price = new Prisma.Decimal(updateData.price);
    }

    // Handle Date conversion if startDate is present
    if (updateData.startDate && typeof updateData.startDate === 'string') {
        updateData.startDate = new Date(updateData.startDate);
    }

    return prisma.course.update({
        where: { id: courseId },
        data: updateData,
    });
};

export const getCourseById = async (courseId: string) => {
    return prisma.course.findUnique({
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

import * as activityService from './activity.service';
import { ActivityType } from '@prisma/client';

export const publishCourse = async (courseId: string, userId: string) => {
    const course = await getCourseById(courseId);

    if (!course || course.creatorId !== userId) {
        throw new Error('Unauthorized');
    }

    // Validation: Must have at least one section and one lesson
    if (course.sections.length === 0) {
        throw new Error('Course must have at least one section to be published');
    }

    const hasLyrics = course.sections.some((section: any) => section.lessons.length > 0);
    if (!hasLyrics) {
        throw new Error('Course must have at least one lesson to be published');
    }

    const updatedCourse = await prisma.course.update({
        where: { id: courseId },
        data: { status: 'PUBLISHED' },
    });

    await activityService.logActivity(userId, ActivityType.PUBLISHED_COURSE, { courseId });
    return updatedCourse;
};

export const listCourses = async (userId: string) => {
    return prisma.course.findMany({
        where: { creatorId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
            skill: true,
            _count: {
                select: { sections: true } // Quick stats
            }
        }
    });
};

export const getEnrolledCourses = async (userId: string) => {
    // 1. Fetch active enrollments (Primary source, contains progress)
    const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        orderBy: { enrolledAt: 'desc' },
        include: {
            course: {
                include: {
                    creator: { select: { id: true, fullName: true, avatarUrl: true } },
                    skill: true,
                    _count: { select: { sections: true } }
                }
            }
        }
    });

    // 2. Fetch completed orders (Secondary source, in case Enrollment creation failed)
    const orders = await prisma.order.findMany({
        where: {
            userId,
            status: 'COMPLETED',
            // Exclude courses we already found in enrollments
            courseId: { notIn: enrollments.map(e => e.courseId) }
        },
        orderBy: { createdAt: 'desc' },
        include: {
            course: {
                include: {
                    creator: { select: { id: true, fullName: true, avatarUrl: true } },
                    skill: true,
                    _count: { select: { sections: true } }
                }
            }
        }
    });

    // 3. Map Enrollments
    const enrolledCourses = enrollments.map(e => ({
        ...e.course,
        progress: e.progress,
        enrolledAt: e.enrolledAt,
        source: 'enrollment'
    }));

    // 4. Map Orders (Default progress to 0)
    const orderedCourses = orders.map(o => ({
        ...o.course,
        progress: 0,
        enrolledAt: o.createdAt, // Use order date as enrollment date
        source: 'order_fallback'
    }));

    // 5. Combine (Orders first? Or Enrollments first? Usually sort by date)
    const allCourses = [...enrolledCourses, ...orderedCourses];

    // Sort by most recent interaction (enrolledAt)
    allCourses.sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime());

    return allCourses;
};

export const deleteCourse = async (courseId: string, userId: string) => {
    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!course || course.creatorId !== userId) {
        throw new Error('Unauthorized');
    }

    // Cascade delete is handled by Prisma if configured, but let's be explicit if needed.
    // Assuming Prisma Relation 'onDelete: Cascade' is set for Sections -> Courses.
    // If not, we might need manual cleanup. For now, we assume schema handles it or we attempt delete.
    return prisma.course.delete({
        where: { id: courseId }
    });
};

export const searchCourses = async (filters: any) => {
    const {
        q,
        categoryId,
        skillId,
        level,
        type, // 'mode' in request, maps to CourseFormat (type)
        minPrice,
        maxPrice,
        lat,
        lng,
        radius = 50, // default 50km
        sort = 'newest',
        page = 1,
        limit = 10
    } = filters;

    const where: Prisma.CourseWhereInput = {
        status: 'PUBLISHED',
    };

    // Text Search
    if (q) {
        where.OR = [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
        ];
    }

    // Exact Filters
    if (categoryId) where.categoryId = categoryId;
    if (skillId) where.skillId = skillId;
    if (level) where.level = level;
    if (type) where.type = type;

    // Price Range
    if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) where.price.gte = new Prisma.Decimal(minPrice);
        if (maxPrice !== undefined) where.price.lte = new Prisma.Decimal(maxPrice);
    }

    // Geo-Location (Bounding Box)
    // 1 deg lat ~= 111km
    if (lat && lng) {
        const r = Number(radius);
        const latDelta = r / 111;
        const lngDelta = r / (111 * Math.cos(Number(lat) * (Math.PI / 180)));

        where.latitude = {
            gte: Number(lat) - latDelta,
            lte: Number(lat) + latDelta
        };
        where.longitude = {
            gte: Number(lng) - lngDelta,
            lte: Number(lng) + lngDelta
        };
    }

    // Pagination
    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    // Sorting
    let orderBy: Prisma.CourseOrderByWithRelationInput | Prisma.CourseOrderByWithRelationInput[] = { createdAt: 'desc' };

    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'rating') orderBy = { averageRating: 'desc' };
    // Note: 'distance' sort requires raw query or in-memory. 
    // For now, we rely on bounding box filtering for relevance.

    // Execute
    const [courses, total] = await Promise.all([
        prisma.course.findMany({
            where,
            include: {
                creator: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                    }
                },
                category: true,
                skill: true,
            },
            take,
            skip,
            orderBy,
        }),
        prisma.course.count({ where })
    ]);

    // Enhance response with calculated distance if lat/lng provided
    const data = courses.map((course: any) => {
        let distance = null;
        if (lat && lng && course.latitude && course.longitude) {
            // Haversine
            const R = 6371;
            const dLat = (course.latitude - Number(lat)) * Math.PI / 180;
            const dLon = (course.longitude - Number(lng)) * Math.PI / 180;
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Number(lat) * Math.PI / 180) * Math.cos(course.latitude * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            distance = R * c; // Distance in km
        }

        return {
            ...course,
            distance: distance ? parseFloat(distance.toFixed(2)) : undefined
        };
    });

    // In-memory sort for distance if requested (only works well for current page, ideally should be DB side)
    if (sort === 'distance' && lat && lng) {
        data.sort((a: any, b: any) => (a.distance || 999999) - (b.distance || 999999));
    }

    return {
        data,
        meta: {
            total,
            page: Number(page),
            pages: Math.ceil(total / take),
            limit: take
        }
    };
};
