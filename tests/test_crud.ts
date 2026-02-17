
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = 'http://localhost:3001';
let AUTH_TOKEN = '';

// Helper to login and get token (Simulated or use existing flow)
// Assuming we have a user. If not, we might need to register one OR manual token.
// For this test, let's assume we can register a temp user.

const main = async () => {
    try {
        console.log('--- STARTING CRUD TEST ---');

        // 1. Setup User
        const email = `testuser_${Date.now()}@example.com`;
        const password = 'Password123!';

        console.log(`1. Creating user: ${email}`);
        const regRes = await axios.post(`${BASE_URL}/auth/register`, {
            email,
            password,
            fullName: 'CRUD Tester'
        });

        // Login to get token
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email,
            password
        });
        AUTH_TOKEN = loginRes.data.token;
        console.log('   Logged in successfully.');
        const headers = { Authorization: `Bearer ${AUTH_TOKEN}` };

        // 2. Create Course
        console.log('2. Creating Course...');

        // Fetch a valid category first
        const catRes = await axios.get(`${BASE_URL}/categories`);
        if (!catRes.data || catRes.data.length === 0) throw new Error('No categories found to link course');
        const validCategoryId = catRes.data[0].id;
        // const validSkillId = catRes.data[0].skills[0]?.id; // Optional

        const coursePayload = {
            title: 'CRUD Test Course',
            description: 'Testing create implementation',
            categoryId: validCategoryId, // Dynamic ID
            // skillId: validSkillId,    // Dynamic ID (Optional)
            level: 'BEGINNER',
            type: 'LIVE',
            price: 49.99
        };

        const courseRes = await axios.post(`${BASE_URL}/courses`, coursePayload, { headers });
        const courseId = courseRes.data.id;
        console.log(`   Course created: ${courseId}`);
        console.log(`   Course Type: ${courseRes.data.type}`);

        if (courseRes.data.type !== 'LIVE') throw new Error('Course type not saved correctly');

        // 3. List Courses
        console.log('3. Listing Courses...');
        const listRes = await axios.get(`${BASE_URL}/courses`, { headers });
        const hasCourse = listRes.data.some((c: any) => c.id === courseId);
        console.log(`   Course found in list: ${hasCourse}`);
        if (!hasCourse) throw new Error('Course not found in list');

        // 4. Add Section
        console.log('4. Adding Section...');
        const sectionRes = await axios.post(`${BASE_URL}/courses/${courseId}/sections`, {
            title: 'Section 1',
            order: 1
        }, { headers });
        const sectionId = sectionRes.data.id;
        console.log(`   Section created: ${sectionId}`);

        // 5. Update Section
        console.log('5. Updating Section...');
        const updateSecRes = await axios.patch(`${BASE_URL}/courses/sections/${sectionId}`, {
            title: 'Section Updated'
        }, { headers });
        console.log(`   Section updated: ${updateSecRes.data.title === 'Section Updated'}`);

        // 6. Add Lesson
        console.log('6. Adding Lesson...');
        const lessonRes = await axios.post(`${BASE_URL}/courses/sections/${sectionId}/lessons`, {
            title: 'Lesson 1',
            order: 1
        }, { headers });
        const lessonId = lessonRes.data.id;
        console.log(`   Lesson created: ${lessonId}`);

        // 7. Get Lesson
        console.log('7. Getting Lesson...');
        const getLessonRes = await axios.get(`${BASE_URL}/courses/lessons/${lessonId}`, { headers });
        console.log(`   Lesson fetched: ${getLessonRes.data.id === lessonId}`);

        // 8. Delete Lesson
        console.log('8. Deleting Lesson...');
        await axios.delete(`${BASE_URL}/courses/lessons/${lessonId}`, { headers });
        console.log('   Lesson deleted.');

        // Verify deletion
        try {
            await axios.get(`${BASE_URL}/courses/lessons/${lessonId}`, { headers });
            throw new Error('Lesson should be deleted but was found');
        } catch (e: any) {
            if (e.response && e.response.status === 404) {
                console.log('   Lesson confirmed deleted (404).');
            } else {
                throw e;
            }
        }

        // 9. Delete Section
        console.log('9. Deleting Section...');
        await axios.delete(`${BASE_URL}/courses/sections/${sectionId}`, { headers });
        console.log('   Section deleted.');

        // 10. Delete Course
        console.log('10. Deleting Course...');
        await axios.delete(`${BASE_URL}/courses/${courseId}`, { headers });
        console.log('   Course deleted.');

        // Verify deletion
        try {
            await axios.get(`${BASE_URL}/courses/${courseId}`, { headers });
            throw new Error('Course should be deleted but was found');
        } catch (e: any) {
            if (e.response && e.response.status === 404) {
                console.log('   Course confirmed deleted (404).');
            } else {
                throw e;
            }
        }

        console.log('--- TEST COMPLETED SUCCESSFULLY ---');

    } catch (error: any) {
        console.error('Test Failed:', JSON.stringify(error.response?.data || error.message, null, 2));
        process.exit(1);
    }
};

main();
