-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('active', 'completed', 'paused');

-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "status" "GoalStatus" NOT NULL DEFAULT 'active';
