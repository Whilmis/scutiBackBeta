import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest';
import * as courseController from '../controllers/course.controller';
import * as curriculumController from '../controllers/curriculum.controller';
import {
    createCourseSchema,
    updateCourseSchema,
    createSectionSchema,
    createLessonSchema,
    updateLessonSchema,
    updateSectionSchema
} from '../schemas/course.schema';

const router = Router();

// Public Routes
router.get('/search', courseController.searchCourses);
// Protected route for enrolled courses - moved up to avoid collision with /:id
router.get('/enrolled', authenticate, courseController.listEnrolledCourses);
router.get('/:id', courseController.getCourse); // Public course details

// Apply auth to all remaining routes
router.use(authenticate);

import {
    uploadCourseCover,
    uploadLessonVideo,
    uploadLessonMaterial,
    uploadAvatar // Not used here but available
} from '../middlewares/upload.middleware';

// Course Management
router.post('/', validateRequest(createCourseSchema), courseController.createCourse);
// router.get('/enrolled', ...); // Moved up
router.get('/', courseController.listCourses); // Created Courses
router.patch('/:id', validateRequest(updateCourseSchema), courseController.updateCourse);
router.patch('/:id/cover', uploadCourseCover.single('cover'), courseController.uploadCoverImage);
router.delete('/:id', courseController.deleteCourse); // Delete
router.post('/:id/publish', courseController.publishCourse);

// Curriculum Management
router.post('/:courseId/sections', validateRequest(createSectionSchema), curriculumController.addSection);
router.patch('/sections/:id', validateRequest(updateSectionSchema), curriculumController.updateSection); // Update Section
router.delete('/sections/:id', curriculumController.deleteSection); // Delete Section

router.post('/sections/:sectionId/lessons', validateRequest(createLessonSchema), curriculumController.addLesson);
router.get('/lessons/:id', curriculumController.getLesson); // Get Lesson
router.patch('/lessons/:id', validateRequest(updateLessonSchema), curriculumController.updateLesson);
router.delete('/lessons/:id', curriculumController.deleteLesson); // Delete Lesson
router.patch('/lessons/:id/video', uploadLessonVideo.single('video'), curriculumController.uploadLessonVideo);
router.post('/lessons/:id/materials', uploadLessonMaterial.single('material'), curriculumController.uploadLessonMaterial);

export default router;
