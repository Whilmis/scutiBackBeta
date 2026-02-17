
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // Fetch specifically the user 'prueba@gmail.com' or similar
    // to see why their courses aren't showing
    // Let's find the first user that has ANY enrollments or orders
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { enrollments: { some: {} } },
                { orders: { some: {} } }
            ]
        },
        include: {
            enrollments: true,
            orders: {
                include: { course: true }
            }
        }
    });

    if (!user) {
        console.log('No user found with enrollments or orders.');
        return;
    }

    console.log(`User Found: ${user.email} (${user.id})`);
    console.log(`Enrollments Count: ${user.enrollments.length}`);
    user.enrollments.forEach(e => console.log(` - Course: ${e.courseId}, Progress: ${e.progress}%`));

    console.log(`Orders Count: ${user.orders.length}`);
    user.orders.forEach(o => console.log(` - Order: ${o.id}, Course: ${o.courseId}, Status: ${o.status}`));
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
