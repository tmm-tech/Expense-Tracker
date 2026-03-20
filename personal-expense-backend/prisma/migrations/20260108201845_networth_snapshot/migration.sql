/*
  Warnings:

  - You are about to drop the column `amount` on the `investments` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `investments` table. All the data in the column will be lost.
  - Added the required column `currentValue` to the `investments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `principal` to the `investments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `investments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "investments" DROP COLUMN "amount",
DROP COLUMN "createdAt",
ADD COLUMN     "contribution" DOUBLE PRECISION,
ADD COLUMN     "currentValue" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "principal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;
