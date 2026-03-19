/*
  Warnings:

  - You are about to drop the column `claimAccountName` on the `Incentive` table. All the data in the column will be lost.
  - You are about to drop the column `claimAccountNumber` on the `Incentive` table. All the data in the column will be lost.
  - You are about to drop the column `claimIFSC` on the `Incentive` table. All the data in the column will be lost.
  - You are about to drop the column `claimUPI` on the `Incentive` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Incentive" DROP COLUMN "claimAccountName",
DROP COLUMN "claimAccountNumber",
DROP COLUMN "claimIFSC",
DROP COLUMN "claimUPI",
ADD COLUMN     "bankAccountName" TEXT,
ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankIfscCode" TEXT,
ADD COLUMN     "claimNote" TEXT,
ADD COLUMN     "upiId" TEXT;
