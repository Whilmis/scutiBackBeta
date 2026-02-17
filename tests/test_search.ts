
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = 'http://localhost:3001';
let AUTH_TOKEN = '';

const main = async () => {
    try {
        console.log('--- STARTING SEARCH TEST ---');

        // 1. Setup User & Login
        const email = `search_tester_${Date.now()}@example.com`;
        const password = 'Password123!';

        await axios.post(`${BASE_URL}/auth/register`, {
            email,
            password,
            fullName: 'Search Tester'
        });

        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email,
            password
        });
        AUTH_TOKEN = loginRes.data.token;
        const headers = { Authorization: `Bearer ${AUTH_TOKEN}` };

        // 2. Get Categories
        const catRes = await axios.get(`${BASE_URL}/categories`);
        const cat1 = catRes.data[0];
        if (!cat1) throw new Error('No categories found');

        // 3. Create & Publish Courses
        console.log('Creating courses...');

        const courses = [
            {
                title: 'React for Beginners',
                description: 'Learn React from scratch',
                categoryId: cat1.id,
                level: 'BEGINNER',
                type: 'SELF_PACED',
                price: 19.99,
                latitude: 40.7128, // NYC
                longitude: -74.0060
            },
            {
                title: 'Advanced Node.js',
                description: 'Deep dive into Node',
                categoryId: cat1.id,
                level: 'EXPERT',
                type: 'LIVE',
                price: 99.99,
                latitude: 34.0522, // LA
                longitude: -118.2437
            },
            {
                title: 'React Native Workshop',
                description: 'Build mobile apps',
                categoryId: cat1.id,
                level: 'PROFESSIONAL',
                type: 'HYBRID',
                price: 49.99,
                latitude: 40.7306, // NYC nearby
                longitude: -73.9352
            }
        ];

        for (const c of courses) {
            const res = await axios.post(`${BASE_URL}/courses`, c, { headers });
            const courseId = res.data.id;
            // Add a section/lesson to be valid for publishing
            const secRes = await axios.post(`${BASE_URL}/courses/${courseId}/sections`, { title: 'Intro', order: 1 }, { headers });
            await axios.post(`${BASE_URL}/courses/sections/${secRes.data.id}/lessons`, { title: 'Welcome', order: 1 }, { headers });

            // Publish
            await axios.post(`${BASE_URL}/courses/${courseId}/publish`, {}, { headers });
            console.log(`   Published: ${c.title}`);
        }

        // 4. Test Search Filters
        console.log('Testing Filters...');

        // Text Search
        const qRes = await axios.get(`${BASE_URL}/courses/search?q=React`);
        console.log(`   Search 'React': found ${qRes.data.meta.total} (Expect 2)`);
        if (qRes.data.meta.total !== 2) console.warn('   WARNING: Text search count mismatch');

        // Price Filter
        const priceRes = await axios.get(`${BASE_URL}/courses/search?minPrice=50`);
        console.log(`   Price > 50: found ${priceRes.data.meta.total} (Expect 1: Node.js)`);

        // Level Filter
        const levelRes = await axios.get(`${BASE_URL}/courses/search?level=BEGINNER`);
        console.log(`   Level BEGINNER: found ${levelRes.data.meta.total} (Expect 1)`);

        // Geo Filter (NYC Radius)
        // NYC Lat 40.7128, Lng -74.0060. The other NYC one is close. LA is far.
        const geoRes = await axios.get(`${BASE_URL}/courses/search?lat=40.7128&lng=-74.0060&radius=50`);
        console.log(`   Geo Search NYC (50km): found ${geoRes.data.meta.total} (Expect 2)`);

        // Sorting
        const sortRes = await axios.get(`${BASE_URL}/courses/search?sort=price_desc`);
        const firstPrice = sortRes.data.data[0].price;
        console.log(`   Sort Price Desc: First item price ${firstPrice} (Expect 99.99)`);

        console.log('--- TEST COMPLETED ---');

    } catch (error: any) {
        console.error('Test Failed Detailed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('No response received');
        }
    }
};

main();
