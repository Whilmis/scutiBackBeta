import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

const testS3 = async () => {
    const s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
        }
    });

    try {
        console.log(`Testing S3 Upload to bucket: ${process.env.AWS_BUCKET_NAME} in region ${process.env.AWS_REGION}`);

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: 'test-folder/test-file.txt',
            Body: 'Hello from Scuti Backend Test',
            ContentType: 'text/plain',
            ACL: 'public-read'
        });

        const response = await s3Client.send(command);
        console.log('✅ Upload Success:', response);
    } catch (error: any) {
        console.error('❌ Upload Failed:');
        console.error(error.message);
        console.error(error.$metadata?.httpStatusCode);
    }
};

testS3();
