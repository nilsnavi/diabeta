-- CreateEnum
CREATE TYPE "FeelingType" AS ENUM ('good', 'normal', 'weakness', 'dizzy', 'bad', 'other');

-- CreateEnum
CREATE TYPE "SymptomType" AS ENUM ('sweating', 'tremor', 'hunger', 'headache', 'drowsiness', 'anxiety', 'nausea', 'thirst', 'frequent_urination', 'other');

-- CreateTable
CREATE TABLE "feeling_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feeling" "FeelingType" NOT NULL,
    "symptoms" "SymptomType"[] DEFAULT ARRAY[]::"SymptomType"[],
    "mood" INTEGER,
    "energyLevel" INTEGER,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "feeling_entries_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "feeling_entries" ADD CONSTRAINT "feeling_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;