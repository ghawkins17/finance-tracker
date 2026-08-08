/*
  Warnings:

  - Made the column `userId` on table `Transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");
