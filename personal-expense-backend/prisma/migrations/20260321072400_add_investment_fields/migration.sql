-- AlterTable
ALTER TABLE "investments" ADD COLUMN     "currentPrice" DOUBLE PRECISION,
ADD COLUMN     "maturityDate" TIMESTAMP(3),
ADD COLUMN     "premium" DOUBLE PRECISION,
ADD COLUMN     "purchasePrice" DOUBLE PRECISION,
ADD COLUMN     "quantity" DOUBLE PRECISION,
ADD COLUMN     "sumAssured" DOUBLE PRECISION;
