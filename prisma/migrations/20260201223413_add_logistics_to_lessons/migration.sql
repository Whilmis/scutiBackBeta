-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('VIDEO', 'LIVE', 'WORKSHOP', 'TEXT');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "frequency" TEXT;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "location" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "type" "LessonType" NOT NULL DEFAULT 'VIDEO';
