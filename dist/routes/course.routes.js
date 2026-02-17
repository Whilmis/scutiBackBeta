"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validateRequest_1 = require("../middlewares/validateRequest");
const courseController = __importStar(require("../controllers/course.controller"));
const curriculumController = __importStar(require("../controllers/curriculum.controller"));
const course_schema_1 = require("../schemas/course.schema");
const router = (0, express_1.Router)();
// Apply auth to all except GET (if public) - assumming creators need auth
router.use(auth_middleware_1.authenticate);
const upload_middleware_1 = require("../middlewares/upload.middleware");
// Course Management
router.post('/', (0, validateRequest_1.validateRequest)(course_schema_1.createCourseSchema), courseController.createCourse);
router.get('/:id', courseController.getCourse);
router.patch('/:id', (0, validateRequest_1.validateRequest)(course_schema_1.updateCourseSchema), courseController.updateCourse);
router.patch('/:id/cover', upload_middleware_1.uploadCourseCover.single('cover'), courseController.uploadCoverImage); // New
router.post('/:id/publish', courseController.publishCourse);
// Curriculum Management
router.post('/:courseId/sections', (0, validateRequest_1.validateRequest)(course_schema_1.createSectionSchema), curriculumController.addSection);
router.post('/sections/:sectionId/lessons', (0, validateRequest_1.validateRequest)(course_schema_1.createLessonSchema), curriculumController.addLesson);
router.patch('/lessons/:id', (0, validateRequest_1.validateRequest)(course_schema_1.updateLessonSchema), curriculumController.updateLesson);
router.patch('/lessons/:id/video', upload_middleware_1.uploadLessonVideo.single('video'), curriculumController.uploadLessonVideo); // New
router.post('/lessons/:id/materials', upload_middleware_1.uploadLessonMaterial.single('material'), curriculumController.uploadLessonMaterial); // New
exports.default = router;
