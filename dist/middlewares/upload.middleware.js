"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLessonMaterial = exports.uploadLessonVideo = exports.uploadCourseCover = exports.uploadAvatar = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const s3_1 = __importDefault(require("../config/s3"));
const bucketName = process.env.AWS_BUCKET_NAME || 'scuti-avatars-dev';
const createUploadMiddleware = (folder, type, maxFileSize = 5 * 1024 * 1024) => {
    // File Filter
    const fileFilter = (req, file, cb) => {
        if (type === 'all')
            return cb(null, true);
        const mime = file.mimetype;
        let allowed = false;
        if (type === 'image' && (mime === 'image/jpeg' || mime === 'image/png' || mime === 'image/webp'))
            allowed = true;
        if (type === 'video' && (mime === 'video/mp4' || mime === 'video/quicktime' || mime === 'video/webm'))
            allowed = true;
        if (type === 'document' && (mime === 'application/pdf' || mime === 'application/zip' || mime === 'application/x-zip-compressed'))
            allowed = true;
        if (allowed) {
            cb(null, true);
        }
        else {
            cb(new Error(`Invalid file type for ${folder}. Allowed: ${type}`), false);
        }
    };
    // S3 Storage
    const storage = (0, multer_s3_1.default)({
        s3: s3_1.default,
        bucket: bucketName,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const fileExt = file.originalname.split('.').pop();
            const uniqueSuffix = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            // Key format: folder/filename.ext
            cb(null, `${folder}/${uniqueSuffix}.${fileExt}`);
        }
    });
    return (0, multer_1.default)({
        storage: storage,
        fileFilter: fileFilter,
        limits: { fileSize: maxFileSize }
    });
};
// Export pre-configured middlewares
exports.uploadAvatar = createUploadMiddleware('avatars', 'image', 5 * 1024 * 1024); // 5MB
exports.uploadCourseCover = createUploadMiddleware('courses/covers', 'image', 5 * 1024 * 1024); // 5MB
exports.uploadLessonVideo = createUploadMiddleware('courses/videos', 'video', 500 * 1024 * 1024); // 500MB
exports.uploadLessonMaterial = createUploadMiddleware('courses/materials', 'document', 50 * 1024 * 1024); // 50MB
