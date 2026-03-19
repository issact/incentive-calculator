import { prisma } from "../../../lib/prisma"
import { IncentiveStatus, type Prisma } from "../../../generated/prisma/client"
import { LEVEL_ORDER } from "../rules/roleLevelMap"
import { logEvent } from "../helpers/events"

export async function reopenIncentive(incentiveId: string, actorId: string) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {

        const incentive = await tx.incentive.findUnique({ where: { id: incentiveId } })

        if (!incentive) throw new Error("Incentive not found")
        if (incentive.status !== IncentiveStatus.ON_HOLD) throw new Error("Only held incentives can be reopened")
        if (incentive.heldById !== actorId) throw new Error("Only holder can reopen")
        if (incentive.reviewerUserId !== actorId) throw new Error("Only reviewer can reopen")

        const index = LEVEL_ORDER.indexOf(incentive.level)
        const upperLevels = LEVEL_ORDER.slice(index + 1)

        const updated = await tx.incentive.update({
            where: { id: incentiveId },
            data: {
                status: IncentiveStatus.PENDING_REVIEW,
                holdReason: null,
                heldById: null
            }
        })

        await tx.incentive.updateMany({
            where: {
                saleId: incentive.saleId,
                level: { in: upperLevels },
                status: IncentiveStatus.ON_HOLD,
                heldById: actorId
            },
            data: {
                status: IncentiveStatus.PENDING_REVIEW,
                holdReason: null,
                heldById: null
            }
        })

        await logEvent(tx, {
            incentiveId,
            actorUserId: actorId,
            fromStatus: incentive.status,
            toStatus: IncentiveStatus.PENDING_REVIEW,
            reason: "Reopened for review"
        })

        return updated
    })
}