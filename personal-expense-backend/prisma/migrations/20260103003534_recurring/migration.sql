/*
  Warnings:

  - Made the column `endDate` on table `SavingsChallenge` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SavingsChallenge" ALTER COLUMN "endDate" SET NOT NULL;
