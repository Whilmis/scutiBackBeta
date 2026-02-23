import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    // 1. Programming
    // 1. Technology (Programming & Data)
    const tech = await prisma.category.upsert({
        where: { title: 'Technology' },
        update: {},
        create: {
            title: 'Technology',
            icon: 'code',
            colorClass: 'text-primary',
            bgClass: 'bg-primary/10',
            borderClass: 'border-primary/20',
            skills: {
                create: [
                    { name: 'JavaScript' }, { name: 'TypeScript' }, { name: 'Python' },
                    { name: 'React' }, { name: 'Next.js' }, { name: 'Node.js' },
                    { name: 'AWS' }, { name: 'Docker' }, { name: 'Rust' },
                    { name: 'SQL' }, { name: 'Machine Learning' }, { name: 'Cybersecurity' }
                ]
            }
        },
    });

    // 2. Design & Art
    const design = await prisma.category.upsert({
        where: { title: 'Design & Art' },
        update: {},
        create: {
            title: 'Design & Art',
            icon: 'palette',
            colorClass: 'text-fuchsia-400',
            bgClass: 'bg-fuchsia-500/10',
            borderClass: 'border-fuchsia-500/20',
            skills: {
                create: [
                    { name: 'Figma' }, { name: 'UI/UX Design' }, { name: 'Graphic Design' },
                    { name: 'Motion Graphics' }, { name: '3D Modeling' }, { name: 'Adobe Creative Suite' }
                ]
            }
        },
    });

    // 3. Marketing & Business
    const marketing = await prisma.category.upsert({
        where: { title: 'Marketing' },
        update: {},
        create: {
            title: 'Marketing',
            icon: 'campaign',
            colorClass: 'text-yellow-400',
            bgClass: 'bg-yellow-500/10',
            borderClass: 'border-yellow-500/20',
            skills: {
                create: [
                    { name: 'Digital Marketing' }, { name: 'SEO' }, { name: 'Content Marketing' },
                    { name: 'Social Media Management' }, { name: 'Copywriting' }, { name: 'Brand Strategy' },
                    { name: 'Google Ads' }, { name: 'Email Marketing' }
                ]
            }
        },
    });

    // 4. Sports & Fitness
    const sports = await prisma.category.upsert({
        where: { title: 'Sports' },
        update: {},
        create: {
            title: 'Sports',
            icon: 'sports_basketball',
            colorClass: 'text-green-400',
            bgClass: 'bg-green-500/10',
            borderClass: 'border-green-500/20',
            skills: {
                create: [
                    { name: 'Basketball' }, { name: 'Soccer' }, { name: 'Tennis' },
                    { name: 'Personal Training' }, { name: 'Yoga' }, { name: 'Swimming' },
                    { name: 'Nutrition' }, { name: 'Martial Arts' }
                ]
            }
        },
    });

    // 5. Example Manual Category
    const manualCategory = await prisma.category.upsert({
        where: { title: 'Manual Category' },
        update: {},
        create: {
            title: 'Manual Category', // Name of the category
            icon: 'star', // Icon name (from Material Icons or similar)
            colorClass: 'text-blue-400', // Tailwind text color
            bgClass: 'bg-blue-500/10', // Tailwind bg color
            borderClass: 'border-blue-500/20', // Tailwind border color
            skills: {
                create: [
                    { name: 'Skill One' },
                    { name: 'Skill Two' }
                ]
            }
        },
    });

    console.log({ tech, design, marketing, sports, manualCategory });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
