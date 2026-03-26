/*
  Warnings:

  - You are about to drop the column `avgTicketCents` on the `EmployeeKPI` table. All the data in the column will be lost.
  - You are about to drop the column `totalSalesCents` on the `EmployeeKPI` table. All the data in the column will be lost.
  - You are about to drop the column `amountCents` on the `Incentive` table. All the data in the column will be lost.
  - You are about to drop the column `formulaText` on the `Incentive` table. All the data in the column will be lost.
  - You are about to drop the column `capCents` on the `IncentiveRule` table. All the data in the column will be lost.
  - You are about to drop the column `saleValueCents` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `assessedValueCents` on the `ValuationSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `marketValueCents` on the `ValuationSnapshot` table. All the data in the column will be lost.
  - Added the required column `avgTicketValue` to the `EmployeeKPI` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalSalesValue` to the `EmployeeKPI` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseAmount` to the `Incentive` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalAmount` to the `Incentive` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewerUserId` to the `Incentive` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rulePercent` to the `Incentive` table without a default value. This is not possible if the table is not empty.
  - Added the required column `saleValue` to the `Incentive` table without a default value. This is not possible if the table is not empty.
  - Added the required column `submittedById` to the `Incentive` table without a default value. This is not possible if the table is not empty.
  - Added the required column `saleValue` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marketValue` to the `ValuationSnapshot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmployeeKPI" DROP COLUMN "avgTicketCents",
DROP COLUMN "totalSalesCents",
ADD COLUMN     "avgTicketValue" BIGINT NOT NULL,
ADD COLUMN     "totalSalesValue" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "Incentive" DROP COLUMN "amountCents",
DROP COLUMN "formulaText",
ADD COLUMN     "adjustedAmount" BIGINT,
ADD COLUMN     "baseAmount" BIGINT NOT NULL,
ADD COLUMN     "finalAmount" BIGINT NOT NULL,
ADD COLUMN     "manualOverrideAmount" BIGINT,
ADD COLUMN     "manualOverrideReason" TEXT,
ADD COLUMN     "performanceScore" DECIMAL(5,2),
ADD COLUMN     "reviewerUserId" TEXT NOT NULL,
ADD COLUMN     "rulePercent" DECIMAL(5,2) NOT NULL,
ADD COLUMN     "saleValue" BIGINT NOT NULL,
ADD COLUMN     "scoreMultiplier" DECIMAL(5,2),
ADD COLUMN     "submittedById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "IncentiveRule" DROP COLUMN "capCents",
ADD COLUMN     "capValue" BIGINT;

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "saleValueCents",
ADD COLUMN     "saleValue" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "ValuationSnapshot" DROP COLUMN "assessedValueCents",
DROP COLUMN "marketValueCents",
ADD COLUMN     "assessedValue" BIGINT,
ADD COLUMN     "marketValue" BIGINT NOT NULL;

-- CreateIndex
CREATE INDEX "Incentive_reviewerUserId_idx" ON "Incentive"("reviewerUserId");

-- AddForeignKey
ALTER TABLE "Incentive" ADD CONSTRAINT "Incentive_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incentive" ADD CONSTRAINT "Incentive_reviewerUserId_fkey" FOREIGN KEY ("reviewerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
