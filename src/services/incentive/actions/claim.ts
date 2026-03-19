import { IncentiveStatus, type Prisma } from "../../../generated/prisma/client"
import { prisma } from "../../../lib/prisma"
import { logEvent } from "../helpers/events"

export async function claimIncentive(
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

        if (incentive.beneficiaryUserId !== actorId) {
            throw new Error("Not allowed to claim this incentive")
        }

        if (incentive.status !== IncentiveStatus.CLAIMABLE) {
            throw new Error("Incentive not claimable")
        }

        const updated = await tx.incentive.update({
            where: { id: incentiveId },
            data: {
                claimRequestedAt: new Date(),
                status: IncentiveStatus.CLAIM_REQUESTED
            }
        })

        await logEvent(tx, {
            incentiveId,
            actorUserId: actorId,
            fromStatus: incentive.status,
            toStatus: IncentiveStatus.CLAIM_REQUESTED,
            reason: "Claim requested",
            metadata: {
                type: "CLAIM_REQUESTED"
            }
        })

        return updated
    })
}