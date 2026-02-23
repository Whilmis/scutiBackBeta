import prisma from '../lib/prisma';
import { LessonType } from '@prisma/client';

export const getUserCalendar = async (userId: string) => {
    const today = new Date();
    // Optional: We can add filters to get only upcoming events
    // For now, let's fetch all scheduled events to populate the calendar fully

    // 1. TEACHING (Courses created by user)
    const teachingCourses = await prisma.course.findMany({
        where: { creatorId: userId },
        select: {
            id: true,
            title: true,
            coverImage: true,
            sections: {
                select: {
                    title: true,
                    lessons: {
                        where: {
                            startDate: { not: null },
                            type: { in: [LessonType.LIVE, LessonType.WORKSHOP] }
                        }
                    }
                }
            }
        }
    });

    // 2. TAKING (Courses user is enrolled in)
    const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        select: {
            course: {
                select: {
                    id: true,
                    title: true,
                    coverImage: true,
                    sections: {
                        select: {
                            title: true,
                            lessons: {
                                where: {
                                    startDate: { not: null },
                                    type: { in: [LessonType.LIVE, LessonType.WORKSHOP] }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    // 3. FLATTEN & MAP INTO UNIFIED FORMAT
    const events: any[] = [];

    // Map Teaching
    teachingCourses.forEach(course => {
        course.sections.forEach(section => {
            section.lessons.forEach(lesson => {
                events.push({
                    id: lesson.id,
                    title: lesson.title,
                    startDate: lesson.startDate,
                    duration: lesson.duration, // Minutes
                    meetingUrl: lesson.meetingUrl,
                    address: lesson.address,
                    lessonType: lesson.type, // LIVE | WORKSHOP
                    role: 'TEACHING',
                    course: {
                        id: course.id,
                        title: course.title,
                        coverImage: course.coverImage
                    },
                    sectionTitle: section.title
                });
            });
        });
    });

    // Map Taking
    enrollments.forEach(enrollment => {
        const course = enrollment.course;
        course.sections.forEach(section => {
            section.lessons.forEach(lesson => {
                events.push({
                    id: lesson.id,
                    title: lesson.title,
                    startDate: lesson.startDate,
                    duration: lesson.duration,
                    meetingUrl: lesson.meetingUrl,
                    address: lesson.address,
                    lessonType: lesson.type,
                    role: 'TAKING',
                    course: {
                        id: course.id,
                        title: course.title,
                        coverImage: course.coverImage
                    },
                    sectionTitle: section.title
                });
            });
        });
    });

    // Sort all events globally by startDate ascending (closest first)
    events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return events;
};
