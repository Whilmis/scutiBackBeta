
import app from '../src/app';
import axios from 'axios';
import http from 'http';

const PORT = 3333;
const BASE_URL = `http://localhost:${PORT}`;

const main = async () => {
    const server = http.createServer(app);

    try {
        await new Promise<void>((resolve, reject) => {
            server.listen(PORT, () => {
                console.log(`Test Server running on port ${PORT}`);
                resolve();
            });
            server.on('error', reject);
        });

        console.log('--- STARTING STANDALONE DYNAMIC CATEGORIES TEST ---');

        // 1. List Categories
        console.log('1. Listing Categories...');
        const listRes = await axios.get(`${BASE_URL}/categories`);
        console.log(`   Found ${listRes.data.length} categories.`);

        const programming = listRes.data.find((c: any) => c.title === 'Programming');
        if (!programming) throw new Error('Seeding failed: Programming category not found');
        console.log('   Seeding verified ✅');

        // 2. Create New Category
        console.log('2. Creating New Category...');
        const newCatRes = await axios.post(`${BASE_URL}/categories`, {
            title: 'Wellness',
            icon: 'spa',
            colorClass: 'text-green-500',
            bgClass: 'bg-green-500/10',
            borderClass: 'border-green-500/20'
        });
        const newCatId = newCatRes.data.id;
        console.log(`   Category created: ${newCatRes.data.title} (${newCatId})`);

        // 3. Create New Skill
        console.log('3. Creating New Skill...');
        const newSkillRes = await axios.post(`${BASE_URL}/skills`, {
            name: 'Meditation',
            categoryId: newCatId
        });
        console.log(`   Skill created: ${newSkillRes.data.name}`);

        console.log('--- TEST COMPLETED SUCCESSFULLY ---');

    } catch (error: any) {
        console.error('Test Failed:', error.response?.data || error.message);
        process.exit(1);
    } finally {
        server.close();
    }
};

main();
