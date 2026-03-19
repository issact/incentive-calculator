import { IncentiveStatus, type Prisma } from "../../../generated/prisma/client"
import { prisma } from "../../../lib/prisma"
import { logEvent } from "../helpers/events"

export async function markPaid(
    incentiveId: string,
    actorId: string
) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {

        const incentive = await tx.incentive.findUnique({
            where: { id: incentiveId }
        })

        if (!incentive) {
            throw new Error("Incentive not found")
        }

        if (incentive.status === IncentiveStatus.PAID) {
            throw new Error("Incentive already paid")
        }

        if (incentive.status !== IncentiveStatus.CLAIM_REQUESTED) {
            throw new Error("Only claimed incentives can be paid")
        }

        if (!incentive.claimRequestedAt) {
            throw new Error("Incentive not claimed yet")
        }

        const updated = await tx.incentive.update({
            where: { id: incentiveId },
            data: {
                status: IncentiveStatus.PAID,
                paidAt: new Date()
            }
        })

        await logEvent(tx, {
            incentiveId,
            actorUserId: actorId,
            fromStatus: incentive.status,
            toStatus: IncentiveStatus.PAID,
            metadata: {
                type: "PAID"
            }
        })

        return updated
    })
}