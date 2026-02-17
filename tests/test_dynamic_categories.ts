
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = 'http://localhost:3001';

const main = async () => {
    try {
        console.log('--- STARTING DYNAMIC CATEGORIES TEST ---');

        // 1. List Categories (Should have seeded data)
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

        // 3. Create New Skill in that Category
        console.log('3. Creating New Skill...');
        const newSkillRes = await axios.post(`${BASE_URL}/skills`, {
            name: 'Meditation',
            categoryId: newCatId
        });
        console.log(`   Skill created: ${newSkillRes.data.name}`);

        // 4. Verify Skill appears in Category List
        console.log('4. Verifying Skill in List...');
        const listRes2 = await axios.get(`${BASE_URL}/categories`);
        const wellness = listRes2.data.find((c: any) => c.id === newCatId);
        const hasSkill = wellness.skills.some((s: any) => s.name === 'Meditation');

        if (!hasSkill) throw new Error('Skill not found in category relation');
        console.log('   Relation verified ✅');

        console.log('--- TEST COMPLETED SUCCESSFULLY ---');

    } catch (error: any) {
        console.error('Test Failed:', error.response?.data || error.message);
        process.exit(1);
    }
};

main();
