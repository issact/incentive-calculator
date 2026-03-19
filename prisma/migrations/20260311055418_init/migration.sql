/*
  Warnings:

  - A unique constraint covering the columns `[saleId,level]` on the table `Incentive` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Incentive_beneficiaryUserId_idx";

-- DropIndex
DROP INDEX "Incentive_reviewerUserId_idx";

-- DropIndex
DROP INDEX "Incentive_status_idx";

-- CreateIndex
CREATE INDEX "Incentive_reviewerUserId_status_idx" ON "Incentive"("reviewerUserId", "status");

-- CreateIndex
CREATE INDEX "Incentive_beneficiaryUserId_status_idx" ON "Incentive"("beneficiaryUserId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Incentive_saleId_level_key" ON "Incentive"("saleId", "level");
