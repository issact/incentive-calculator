-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SALES', 'TEAM_LEAD', 'MANAGER', 'OWNER_FINANCE', 'ADMIN');

-- CreateEnum
CREATE TYPE "IncentiveStatus" AS ENUM ('PENDING_REVIEW', 'ON_HOLD', 'CLAIMABLE', 'PAID');

-- CreateEnum
CREATE TYPE "IncentiveLevel" AS ENUM ('L1', 'L2', 'L3', 'L4');

-- CreateEnum
CREATE TYPE "IncentiveRuleType" AS ENUM ('PERCENTAGE');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'VILLA', 'PLOT', 'COMMERCIAL');

-- CreateEnum
CREATE TYPE "BrokerChannel" AS ENUM ('DIRECT', 'PARTNER', 'BROKER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "managerId" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "saleCode" TEXT NOT NULL,
    "saleDate" TIMESTAMP(3) NOT NULL,
    "bookingDate" TIMESTAMP(3),
    "closeDate" TIMESTAMP(3),
    "projectName" TEXT NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "unitNumber" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "saleValueCents" BIGINT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "brokerChannel" "BrokerChannel",
    "createdById" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncentiveRule" (
    "id" TEXT NOT NULL,
    "level" "IncentiveLevel" NOT NULL,
    "name" TEXT NOT NULL,
    "ruleType" "IncentiveRuleType" NOT NULL,
    "ratePercent" DECIMAL(5,2) NOT NULL,
    "capCents" BIGINT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "version" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncentiveRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incentive" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "level" "IncentiveLevel" NOT NULL,
    "beneficiaryUserId" TEXT NOT NULL,
    "amountCents" BIGINT NOT NULL,
    "status" "IncentiveStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "formulaText" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "holdReason" TEXT,
    "heldById" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "claimRequestedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incentive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncentiveEvent" (
    "id" TEXT NOT NULL,
    "incentiveId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "fromStatus" "IncentiveStatus",
    "toStatus" "IncentiveStatus" NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncentiveEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValuationSnapshot" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "marketValueCents" BIGINT NOT NULL,
    "assessedValueCents" BIGINT,
    "valuationDate" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ValuationSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeKPI" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodMonth" TEXT NOT NULL,
    "dealsClosed" INTEGER NOT NULL,
    "totalSalesCents" BIGINT NOT NULL,
    "avgTicketCents" BIGINT NOT NULL,
    "conversionRate" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeKPI_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_managerId_idx" ON "User"("managerId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Sale_saleCode_key" ON "Sale"("saleCode");

-- CreateIndex
CREATE INDEX "Sale_createdById_idx" ON "Sale"("createdById");

-- CreateIndex
CREATE INDEX "Sale_projectName_idx" ON "Sale"("projectName");

-- CreateIndex
CREATE INDEX "Sale_saleDate_idx" ON "Sale"("saleDate");

-- CreateIndex
CREATE INDEX "IncentiveRule_level_isActive_idx" ON "IncentiveRule"("level", "isActive");

-- CreateIndex
CREATE INDEX "Incentive_saleId_idx" ON "Incentive"("saleId");

-- CreateIndex
CREATE INDEX "Incentive_beneficiaryUserId_idx" ON "Incentive"("beneficiaryUserId");

-- CreateIndex
CREATE INDEX "Incentive_status_idx" ON "Incentive"("status");

-- CreateIndex
CREATE INDEX "IncentiveEvent_incentiveId_createdAt_idx" ON "IncentiveEvent"("incentiveId", "createdAt");

-- CreateIndex
CREATE INDEX "ValuationSnapshot_saleId_valuationDate_idx" ON "ValuationSnapshot"("saleId", "valuationDate");

-- CreateIndex
CREATE INDEX "EmployeeKPI_periodMonth_idx" ON "EmployeeKPI"("periodMonth");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeKPI_userId_periodMonth_key" ON "EmployeeKPI"("userId", "periodMonth");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incentive" ADD CONSTRAINT "Incentive_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incentive" ADD CONSTRAINT "Incentive_beneficiaryUserId_fkey" FOREIGN KEY ("beneficiaryUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incentive" ADD CONSTRAINT "Incentive_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "IncentiveRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incentive" ADD CONSTRAINT "Incentive_heldById_fkey" FOREIGN KEY ("heldById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incentive" ADD CONSTRAINT "Incentive_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncentiveEvent" ADD CONSTRAINT "IncentiveEvent_incentiveId_fkey" FOREIGN KEY ("incentiveId") REFERENCES "Incentive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncentiveEvent" ADD CONSTRAINT "IncentiveEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValuationSnapshot" ADD CONSTRAINT "ValuationSnapshot_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeKPI" ADD CONSTRAINT "EmployeeKPI_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
