/*
  Warnings:

  - You are about to drop the column `direction` on the `Transaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_transferId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "direction",
ADD COLUMN     "transferAccountId" TEXT,
ADD COLUMN     "transferDirection" TEXT;
