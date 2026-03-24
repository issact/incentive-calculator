import { prisma } from "../lib/prisma"
import { IncentiveStatus, type Prisma } from "../generated/prisma/client"
import type { IncentiveListQuery, SortOrder } from "../utils/pagination"
import { HttpError } from "../utils/errors.js"

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
        status: IncentiveStatus.CLAIM_REQUESTED,
        ...(!query.includeVoided ? ({ sale: { voidedAt: null } }) : {})
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
                    customerName: true,
                    voidedAt: true
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
        throw HttpError.notFound("Incentive not found", { code: "INCENTIVE_NOT_FOUND" })
    }

    if (incentive.sale.voidedAt && incentive.status !== IncentiveStatus.PAID) {
        throw HttpError.conflict("Sale is voided. Action not allowed.", { code: "SALE_VOIDED" })
    }

    if (incentive.status !== IncentiveStatus.CLAIM_REQUESTED &&
        incentive.status !== IncentiveStatus.PAID) {
        throw HttpError.badRequest("Not available for payment view", { code: "INCENTIVE_NOT_PAYABLE_VIEW" })
    }

    return incentive
}
