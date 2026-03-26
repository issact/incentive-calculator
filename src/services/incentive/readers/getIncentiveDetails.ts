import { prisma } from "../../../lib/prisma"


export async function getIncentiveDetails(
    incentiveId: string,
    actorId: string
) {
    const incentive = await prisma.incentive.findUnique({
        where: { id: incentiveId },
        include: {
            sale: true,
            rule: true,

            beneficiaryUser: {
                select: { id: true, name: true, role: true }
            },

            reviewer: {
                select: { id: true, name: true, role: true }
            },

            submittedBy: {
                select: { id: true, name: true, role: true }
            },

            heldBy: {
                select: { id: true, name: true, role: true }
            },

            approvedBy: {
                select: { id: true, name: true, role: true }
            },

            events: {
                include: {
                    actorUser: {
                        select: { id: true, name: true, role: true }
                    }
                },
                orderBy: { createdAt: "asc" }
            }
        }
    })

    if (!incentive) {
        throw new Error("Incentive not found")
    }

    // access control
    if (
        incentive.beneficiaryUserId !== actorId &&
        incentive.reviewerUserId !== actorId
    ) {
        throw new Error("Not allowed to view this incentive")
    }

    return incentive
}