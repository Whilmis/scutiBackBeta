import multer from 'multer';
import multerS3 from 'multer-s3';
import s3Client from '../config/s3';

const bucketName = process.env.AWS_BUCKET_NAME || 'scuti-avatars-dev';

type FolderType = 'avatars' | 'courses/covers' | 'courses/materials' | 'courses/videos' | 'orders/proofs' | 'posts/media' | 'chat/images';
type AllowedFileType = 'image' | 'video' | 'document' | 'all';

const createUploadMiddleware = (folder: FolderType, type: AllowedFileType, maxFileSize: number = 5 * 1024 * 1024) => {

    // File Filter
    const fileFilter = (req: any, file: any, cb: any) => {
        if (type === 'all') return cb(null, true);

        const mime = file.mimetype;
        let allowed = false;

        if (type === 'image' && (mime === 'image/jpeg' || mime === 'image/png' || mime === 'image/webp')) allowed = true;
        if (type === 'video' && (mime === 'video/mp4' || mime === 'video/quicktime' || mime === 'video/webm')) allowed = true;
        if (type === 'document' && (mime === 'application/pdf' || mime === 'application/zip' || mime === 'application/x-zip-compressed')) allowed = true;

        if (allowed) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type for ${folder}. Allowed: ${type}`), false);
        }
    };

    // S3 Storage
    const storage = multerS3({
        s3: s3Client,
        bucket: bucketName,
        metadata: function (req: any, file: any, cb: any) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req: any, file: any, cb: any) {
            const fileExt = file.originalname.split('.').pop();
            const uniqueSuffix = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            // Key format: folder/filename.ext
            cb(null, `${folder}/${uniqueSuffix}.${fileExt}`);
        }
    });

    return multer({
        storage: storage,
        fileFilter: fileFilter,
        limits: { fileSize: maxFileSize }
    });
};

// Export pre-configured middlewares
export const uploadAvatar = createUploadMiddleware('avatars', 'image', 5 * 1024 * 1024); // 5MB
export const uploadCourseCover = createUploadMiddleware('courses/covers', 'image', 10 * 1024 * 1024); // 10MB
export const uploadLessonVideo = createUploadMiddleware('courses/videos', 'video', 1024 * 1024 * 1024); // 1GB
export const uploadLessonMaterial = createUploadMiddleware('courses/materials', 'document', 100 * 1024 * 1024); // 100MB
export const uploadPaymentProof = createUploadMiddleware('orders/proofs', 'image', 5 * 1024 * 1024); // 5MB
export const uploadPostMedia = createUploadMiddleware('posts/media', 'all', 50 * 1024 * 1024); // 50MB for videos
export const uploadChatImage = createUploadMiddleware('chat/images', 'image', 5 * 1024 * 1024); // 5MB
