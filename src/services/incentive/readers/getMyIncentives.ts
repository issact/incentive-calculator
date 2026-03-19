import { prisma } from "../../../lib/prisma"
import { IncentiveStatus } from "../../../generated/prisma/enums"
import { ROLE_LEVEL, LEVEL_ORDER } from "../rules/roleLevelMap"
import { buildIncentiveFilters } from "../queries/filter"
import { buildIncentiveOrderBy } from "../queries/orderBy"
import type { IncentiveListQuery } from "../../../utils/pagination"


export async function getMyIncentives(userId: string, query: IncentiveListQuery) {

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    })

    if (!user) throw new Error("User not found")

    const myLevel = ROLE_LEVEL[user.role]
    if (!myLevel) throw new Error("User role not mapped")

    const myIndex = LEVEL_ORDER.indexOf(myLevel)
    const previousLevel = myIndex > 0 ? LEVEL_ORDER[myIndex - 1] : null

    const visibilityConditions: any[] = []

    if (myLevel === "L1") {
        visibilityConditions.push({ level: "L1" })
    }

    if (previousLevel) {
        visibilityConditions.push({
            AND: [
                { level: myLevel },
                {
                    sale: {
                        incentives: {
                            some: {
                                level: previousLevel,
                                status: { in: [IncentiveStatus.CLAIMABLE, IncentiveStatus.CLAIM_REQUESTED, IncentiveStatus.PAID] }
                            }
                        }
                    }
                }
            ]
        })
    }

    if (myIndex > 0) {
        visibilityConditions.push({
            sale: {
                incentives: {
                    some: {
                        level: { in: LEVEL_ORDER.slice(0, myIndex) },
                        status: IncentiveStatus.ON_HOLD
                    }
                }
            }
        })
    }

    const where = buildIncentiveFilters({
        ...query,
        additional: {
            AND: [
                { beneficiaryUserId: userId },
                { OR: visibilityConditions }
            ]
        }
    })

    const skip = (query.page - 1) * query.limit
    const take = query.limit

    const { data, total } = await prisma.$transaction(async (tx) => {
        const data = await tx.incentive.findMany({
            where,
            include: { sale: true, reviewer: true, approvedBy: true },
            skip,
            take,
            orderBy: buildIncentiveOrderBy(query.sortBy, query.sortOrder)
        })

        const total = await tx.incentive.count({ where })

        return { data, total }
    })

    return { data, total }
}