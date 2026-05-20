-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('walking', 'running', 'gym', 'cardio', 'strength', 'cycling', 'lfk', 'other');

-- CreateEnum
CREATE TYPE "Intensity" AS ENUM ('low', 'medium', 'high');

-- CreateTable
CREATE TABLE "activity_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "intensity" "Intensity" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "activity_entries_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "activity_entries" ADD CONSTRAINT "activity_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;