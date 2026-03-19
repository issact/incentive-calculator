import { prisma } from "../lib/prisma"
import { IncentiveStatus, type Prisma } from "../generated/prisma/client"
import type { IncentiveListQuery, SortOrder } from "../utils/pagination"

function buildOrderBy(sortBy: string | undefined, sortOrder: SortOrder) {
    switch (sortBy) {
        case "createdAt":
            return { createdAt: sortOrder } satisfies Prisma.IncentiveOrderByWithRelationInput
        case "updatedAt":
            return { updatedAt: sortOrder } satisfies Prisma.IncentiveOrderByWithRelationInput
        default:
            return { claimRequestedAt: "desc" } satisfies Prisma.IncentiveOrderByWithRelationInput
    }
}

export async function getPaymentQueue(query: IncentiveListQuery) {

    const where: Prisma.IncentiveWhereInput = {
        status: IncentiveStatus.CLAIM_REQUESTED
    }

    const skip = (query.page - 1) * query.limit
    const take = query.limit
    const orderBy = buildOrderBy(query.sortBy, query.sortOrder)

    const { data, total } = await prisma.$transaction(async (tx) => {

        const data = await tx.incentive.findMany({
            where,
            include: {
                sale: {
                    select: {
                        saleCode: true,
                        projectName: true,
                        customerName: true
                    }
                },
                beneficiaryUser: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                },
                reviewer: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                }
            },
            skip,
            take,
            orderBy
        })

        const total = await tx.incentive.count({ where })

        return { data, total }
    })

    return { data, total }
}

export async function getPaymentDetail(incentiveId: string) {

    const incentive = await prisma.incentive.findUnique({
        where: { id: incentiveId },
        include: {
            sale: {
                select: {
                    saleCode: true,
                    projectName: true,
                    customerName: true
                }
            },
            beneficiaryUser: {
                select: {
                    id: true,
                    name: true,
                    role: true
                }
            }
        }
    })

    if (!incentive) {
        throw new Error("Incentive not found")
    }

    if (incentive.status !== IncentiveStatus.CLAIM_REQUESTED &&
        incentive.status !== IncentiveStatus.PAID) {
        throw new Error("Not available for payment view")
    }

    return incentive
}