/*
  Warnings:

  - You are about to drop the column `location` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Lesson` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "location",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "meetingUrl" TEXT;

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "location",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "meetingUrl" TEXT;
