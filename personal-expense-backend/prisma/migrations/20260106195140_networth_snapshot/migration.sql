/*
  Warnings:

  - Added the required column `notes` to the `Debt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Debt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Debt" ADD COLUMN     "notes" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;
