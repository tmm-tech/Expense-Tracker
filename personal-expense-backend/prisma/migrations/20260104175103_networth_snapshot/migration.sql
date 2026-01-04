/*
  Warnings:

  - Added the required column `totalAssets` to the `NetWorthSnapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalLiabilities` to the `NetWorthSnapshot` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "NetWorthSnapshot_userId_idx";

-- AlterTable
ALTER TABLE "NetWorthSnapshot" ADD COLUMN     "cash" DOUBLE PRECISION,
ADD COLUMN     "debts" DOUBLE PRECISION,
ADD COLUMN     "investments" DOUBLE PRECISION,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "totalAssets" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalLiabilities" DOUBLE PRECISION NOT NULL;
