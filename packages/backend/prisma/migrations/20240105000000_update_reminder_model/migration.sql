-- AlterEnum
-- This migration alters the ReminderType enum

-- Step 1: rename old enum
ALTER TYPE "ReminderType" RENAME TO "ReminderType_old";

-- Step 2: create new enum
CREATE TYPE "ReminderType" AS ENUM (
  'check_glucose',
  'basal_insulin',
  'medication',
  'after_meal_glucose',
  'before_sleep_glucose',
  'sensor_replace',
  'supplies',
  'report',
  'custom'
);

-- Step 3: drop old Reminder table and recreate with new schema
DROP TABLE IF EXISTS "Reminder";

CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ReminderType" NOT NULL,
    "title" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "repeatRule" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSentAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- Step 4: drop old enum
DROP TYPE "ReminderType_old";

-- CreateIndex
CREATE INDEX "Reminder_userId_nextRunAt_idx" ON "Reminder"("userId", "nextRunAt");
CREATE INDEX "Reminder_nextRunAt_enabled_idx" ON "Reminder"("nextRunAt", "enabled");

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;