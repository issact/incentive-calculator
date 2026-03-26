
import { prisma } from "../../../lib/prisma"
import { IncentiveStatus, type Prisma } from "../../../generated/prisma/client"
import { LEVEL_ORDER } from "../rules/roleLevelMap"
import { logEvent } from "../helpers/events"

export async function holdIncentive(
    incentiveId: string,
    actorId: string,
    reason: string
) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {

        const incentive = await tx.incentive.findUnique({ where: { id: incentiveId } })

        if (!incentive) throw new Error("Incentive not found")
        if (incentive.reviewerUserId !== actorId) throw new Error("You are not the assigned reviewer")
        if (incentive.status !== IncentiveStatus.PENDING_REVIEW) throw new Error("Only pending incentives can be held")
        if (!reason?.trim()) throw new Error("Hold reason required")

        const index = LEVEL_ORDER.indexOf(incentive.level)
        const upperLevels = LEVEL_ORDER.slice(index + 1)

        const updated = await tx.incentive.update({
            where: { id: incentiveId },
            data: {
                status: IncentiveStatus.ON_HOLD,
                holdReason: reason.trim(),
                heldById: actorId
            }
        })

        await tx.incentive.updateMany({
            where: {
                saleId: incentive.saleId,
                level: { in: upperLevels },
                status: IncentiveStatus.PENDING_REVIEW
            },
            data: {
                status: IncentiveStatus.ON_HOLD,
                holdReason: reason.trim(),
                heldById: actorId
            }
        })

        await logEvent(tx, {
            incentiveId,
            actorUserId: actorId,
            fromStatus: incentive.status,
            toStatus: IncentiveStatus.ON_HOLD,
            reason: "Held after review"
        })

        return updated
    })
}