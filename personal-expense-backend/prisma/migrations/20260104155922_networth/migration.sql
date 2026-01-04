-- CreateTable
CREATE TABLE "NetWorth" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "NetWorth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NetWorthSnapshot" (
    "id" TEXT NOT NULL,
    "netWorthId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assets" DOUBLE PRECISION NOT NULL,
    "liabilities" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "NetWorthSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NetWorth_userId_idx" ON "NetWorth"("userId");

-- CreateIndex
CREATE INDEX "NetWorthSnapshot_userId_idx" ON "NetWorthSnapshot"("userId");

-- AddForeignKey
ALTER TABLE "NetWorth" ADD CONSTRAINT "NetWorth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NetWorthSnapshot" ADD CONSTRAINT "NetWorthSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NetWorthSnapshot" ADD CONSTRAINT "NetWorthSnapshot_netWorthId_fkey" FOREIGN KEY ("netWorthId") REFERENCES "NetWorth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
