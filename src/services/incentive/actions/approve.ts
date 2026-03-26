import { prisma } from "../../../lib/prisma"
import { IncentiveStatus, type IncentiveLevel, type Prisma } from "../../../generated/prisma/client"
import { LEVEL_ORDER } from "../rules/roleLevelMap"
import { calculateFinalAmount } from "../helpers/calculations"
import { logEvent } from "../helpers/events"

type ApproveInput = {
    performanceScores?: Record<string, number>
    manualOverrideAmount?: number
    reason?: string
}

export async function approveIncentive(
    incentiveId: string,
    actorId: string,
    input?: ApproveInput
) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {

        const incentive = await tx.incentive.findUnique({
            where: { id: incentiveId },
            include: { reviewer: { select: { role: true } } }
        })

        if (!incentive) throw new Error("Incentive not found")
        if (incentive.reviewerUserId !== actorId) throw new Error("You are not the assigned reviewer")

        const REVIEW_ROLE_BY_LEVEL: Record<IncentiveLevel, string> = {
            L1: "TEAM_LEAD",
            L2: "MANAGER",
            L3: "OWNER_FINANCE",
            L4: "ADMIN"
        }

        if (incentive.reviewer.role !== REVIEW_ROLE_BY_LEVEL[incentive.level]) {
            throw new Error("Reviewer role not allowed for this incentive level")
        }

        if (incentive.status === IncentiveStatus.ON_HOLD) {
            throw new Error("Held incentive must be reopened before approval")
        }

        if (incentive.status !== IncentiveStatus.PENDING_REVIEW) {
            throw new Error("Incentive not in review state")
        }

        const index = LEVEL_ORDER.indexOf(incentive.level)
        const lowerLevels = LEVEL_ORDER.slice(0, index)

        const holdExists = await tx.incentive.findFirst({
            where: {
                saleId: incentive.saleId,
                status: IncentiveStatus.ON_HOLD,
                level: { in: lowerLevels }
            }
        })

        if (holdExists) {
            throw new Error("Sale has a held incentive. Resolve hold before approval.")
        }

        const { multiplier, adjusted, finalAmount } = calculateFinalAmount(
            Number(incentive.baseAmount),
            input
        )

        const updated = await tx.incentive.update({
            where: { id: incentiveId },
            data: {
                performanceScore: multiplier,
                scoreMultiplier: multiplier,
                adjustedAmount: BigInt(adjusted),
                manualOverrideAmount: input?.manualOverrideAmount !== undefined
                    ? BigInt(input.manualOverrideAmount)
                    : null,
                manualOverrideReason: input?.reason ?? null,
                finalAmount: BigInt(finalAmount),
                status: IncentiveStatus.CLAIMABLE,
                approvedById: actorId,
                approvedAt: new Date()
            }
        })

        await logEvent(tx, {
            incentiveId,
            actorUserId: actorId,
            fromStatus: incentive.status,
            toStatus: IncentiveStatus.CLAIMABLE,
            reason: "Approved after review",
            metadata: {
                type: "APPROVED",
                performanceScores: input?.performanceScores ?? null,
                multiplier,
                adjustedAmount: adjusted,
                manualOverride: input?.manualOverrideAmount ?? null
            }
        })

        return updated
    })
}