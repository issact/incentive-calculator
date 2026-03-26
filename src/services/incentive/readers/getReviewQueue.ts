
import { IncentiveLevel, IncentiveStatus } from "../../../generated/prisma/enums"
import { prisma } from "../../../lib/prisma"
import type { IncentiveListQuery } from "../../../utils/pagination"
import { buildIncentiveFilters } from "../queries/filter"
import { buildIncentiveOrderBy } from "../queries/orderBy"


export async function getReviewQueue(userId: string, query: IncentiveListQuery) {

    const where = buildIncentiveFilters({
        ...query,
        additional: {
            reviewerUserId: userId,
            AND: [
                {
                    OR: [
                        { status: IncentiveStatus.PENDING_REVIEW },
                        { status: IncentiveStatus.ON_HOLD, heldById: userId }
                    ]
                }
            ],
            OR: [
                { level: IncentiveLevel.L1 },

                {
                    AND: [
                        { level: IncentiveLevel.L2 },
                        {
                            sale: {
                                incentives: {
                                    some: {
                                        level: IncentiveLevel.L1,
                                        status: { in: [IncentiveStatus.CLAIMABLE, IncentiveStatus.CLAIM_REQUESTED, IncentiveStatus.PAID] }
                                    }
                                }
                            }
                        }
                    ]
                },

                {
                    AND: [
                        { level: IncentiveLevel.L3 },
                        {
                            sale: {
                                incentives: {
                                    some: {
                                        level: IncentiveLevel.L2,
                                        status: { in: [IncentiveStatus.CLAIMABLE, IncentiveStatus.CLAIM_REQUESTED, IncentiveStatus.PAID] }
                                    }
                                }
                            }
                        }
                    ]
                },

                {
                    AND: [
                        { level: IncentiveLevel.L4 },
                        {
                            sale: {
                                incentives: {
                                    some: {
                                        level: IncentiveLevel.L3,
                                        status: { in: [IncentiveStatus.CLAIMABLE, IncentiveStatus.CLAIM_REQUESTED, IncentiveStatus.PAID] }
                                    }
                                }
                            }
                        }
                    ]
                }
            ]
        }
    })

    const skip = (query.page - 1) * query.limit
    const take = query.limit

    const { data, total } = await prisma.$transaction(async (tx) => {
        const data = await tx.incentive.findMany({
            where,
            include: {
                sale: true,
                beneficiaryUser: true,
                submittedBy: true
            },
            skip,
            take,
            orderBy: buildIncentiveOrderBy(query.sortBy, query.sortOrder)
        })

        const total = await tx.incentive.count({ where })

        return { data, total }
    })

    return { data, total }
}