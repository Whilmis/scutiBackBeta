
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // 1. Get a user who should have courses
    // You can hardcode a known ID here to test:
    // const userId = "uuid-of-user"; 

    // Or let's try to find one with an enrollment or completed order
    const enrollment = await prisma.enrollment.findFirst();
    const order = await prisma.order.findFirst({ where: { status: 'COMPLETED' } });

    let userId = '';

    if (enrollment) {
        console.log('Found user via Enrollment:', enrollment.userId);
        userId = enrollment.userId;
    } else if (order) {
        console.log('Found user via Order:', order.userId);
        userId = order.userId;
    } else {
        console.log('No enrollments or completed orders found in DB to test with.');
        return;
    }

    console.log('--- Testing getEnrolledCourses for User:', userId, '---');

    // 2. Logic copy-pasted from CourseService.getEnrolledCourses
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
    console.log(`Found ${enrollments.length} enrollments.`);

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

    console.log(`Found ${orders.length} fallback orders.`);

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

    console.log('--- Final Result ---');
    console.log(JSON.stringify(allCourses, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
