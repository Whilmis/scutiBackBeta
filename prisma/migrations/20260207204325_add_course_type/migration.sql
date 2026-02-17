-- CreateEnum
CREATE TYPE "CourseFormat" AS ENUM ('SELF_PACED', 'LIVE', 'IN_PERSON', 'HYBRID');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "type" "CourseFormat" NOT NULL DEFAULT 'HYBRID';
