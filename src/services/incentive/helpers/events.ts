import type { IncentiveStatus, Prisma } from "../../../generated/prisma/client"

export async function logEvent(
    tx: Prisma.TransactionClient,
    data: {
        incentiveId: string
        actorUserId: string
        fromStatus: IncentiveStatus
        toStatus: IncentiveStatus
        reason?: string
        metadata?: any
    }
) {
    return tx.incentiveEvent.create({
        data
    })
}