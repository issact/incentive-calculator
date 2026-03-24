import { prisma } from "../lib/prisma"
import { generateIncentivesForSale } from "../lib/incentive.engine"
import { HttpError } from "../utils/errors.js"
import type { SaleListQuery, SortOrder } from "../utils/pagination.js"
import type { Prisma } from "../generated/prisma/client"
import { notifyReviewersIncentivesCreatedForSale } from "./notification.service.js"
import { createSaleSchema } from "../validations/sale.validation"
import { z } from "zod"


type CreateSaleInput = z.infer<typeof createSaleSchema>

export async function createSale(data: CreateSaleInput, userId: string) {

    const result = await prisma.$transaction(async (tx) => {

        const user = await tx.user.findUnique({
            where: { id: userId },
            select: { managerId: true, role: true }
        })

        if (!user) throw HttpError.notFound("User not found", { code: "USER_NOT_FOUND" })
        if (user.role === "SALES" && !user.managerId) {
            throw HttpError.badRequest("User has no manager assigned", { code: "MANAGER_NOT_ASSIGNED" })
        }


        const saleCreateData = {
            saleCode: data.saleCode,
            saleDate: new Date(data.saleDate),
            projectName: data.projectName,
            propertyType: data.propertyType,
            city: data.city,
            state: data.state,
            saleValue: data.saleValue,
            customerName: data.customerName,
            createdById: userId,
            ...(data.unitNumber !== undefined ? { unitNumber: data.unitNumber } : {}),
            ...(data.customerPhone !== undefined ? { customerPhone: data.customerPhone } : {}),
            ...(data.brokerChannel !== undefined ? { brokerChannel: data.brokerChannel } : {}),
            ...(data.bookingDate !== undefined ? { bookingDate: new Date(data.bookingDate) } : {}),
            ...(data.closeDate !== undefined ? { closeDate: new Date(data.closeDate) } : {}),
            ...(data.notes !== undefined ? { notes: data.notes } : {}),
        } satisfies Prisma.SaleUncheckedCreateInput

        let sale

        try {
            sale = await tx.sale.create({
                data: saleCreateData
            })
        } catch (error: any) {
            if (error?.code === "P2002") {
                throw HttpError.conflict("Sale with this saleCode already exists", { code: "SALE_CODE_EXISTS" })
            }
            throw error
        }

        await generateIncentivesForSale(tx, sale.id)

        return sale
    })

    // Best-effort notification: do not affect core flow.
    void notifyReviewersIncentivesCreatedForSale(result.id)

    return {
        ...result,
        saleValue: result.saleValue.toString()
    }
}

function buildSaleOrderBy(sortBy: string | undefined, sortOrder: SortOrder) {
    switch (sortBy) {
        case "createdAt":
            return { createdAt: sortOrder } satisfies Prisma.SaleOrderByWithRelationInput
        case "updatedAt":
            return { updatedAt: sortOrder } satisfies Prisma.SaleOrderByWithRelationInput
        case "saleDate":
            return { saleDate: sortOrder } satisfies Prisma.SaleOrderByWithRelationInput
        case "projectName":
            return { projectName: sortOrder } satisfies Prisma.SaleOrderByWithRelationInput
        case "saleValue":
            return { saleValue: sortOrder } satisfies Prisma.SaleOrderByWithRelationInput
        default:
            return { createdAt: "desc" } satisfies Prisma.SaleOrderByWithRelationInput
    }
}

function buildSaleWhere(input: {
    search?: string
    projectName?: string
    fromDate?: Date
    toDate?: Date
    includeVoided?: boolean
    additional?: Prisma.SaleWhereInput
}) {
    const and: Prisma.SaleWhereInput[] = []

    if (input.additional) {
        and.push(input.additional)
    }

    if (!input.includeVoided) {
        and.push({ voidedAt: null })
    }

    if (input.projectName) {
        and.push({
            projectName: { contains: input.projectName, mode: "insensitive" }
        })
    }

    if (input.fromDate || input.toDate) {
        and.push({
            saleDate: {
                ...(input.fromDate ? { gte: input.fromDate } : {}),
                ...(input.toDate ? { lte: input.toDate } : {})
            }
        })
    }

    if (input.search) {
        and.push({
            OR: [
                { saleCode: { contains: input.search, mode: "insensitive" } },
                { projectName: { contains: input.search, mode: "insensitive" } },
                { customerName: { contains: input.search, mode: "insensitive" } },
                { city: { contains: input.search, mode: "insensitive" } },
                { state: { contains: input.search, mode: "insensitive" } },
            ]
        })
    }

    return and.length ? ({ AND: and } satisfies Prisma.SaleWhereInput) : ({} satisfies Prisma.SaleWhereInput)
}

async function getDownlineUserIds(rootUserId: string) {
    const visited = new Set<string>()
    const queue: string[] = [rootUserId]

    visited.add(rootUserId)

    while (queue.length) {
        const currentId = queue.shift()!

        const directReports = await prisma.user.findMany({
            where: { managerId: currentId },
            select: { id: true }
        })

        for (const report of directReports) {
            if (!visited.has(report.id)) {
                visited.add(report.id)
                queue.push(report.id)
            }
        }

        // safety brake (cycles / corrupted hierarchy)
        if (visited.size > 10_000) break
    }

    return Array.from(visited)
}

function normalizeSaleForApi<T extends { saleValue: bigint | number }>(sale: T) {
    return {
        ...sale,
        saleValue: sale.saleValue.toString()
    }
}


const saleDetailSelect = {
    id: true,
    saleCode: true,
    saleDate: true,
    projectName: true,
    propertyType: true,
    city: true,
    state: true,
    saleValue: true,
    customerName: true,
    customerPhone: true,
    brokerChannel: true,
    notes: true,
    voidedAt: true,
    voidReason: true,
    voidedBy: {
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    },
    createdAt: true,
    updatedAt: true,
    createdBy: {
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    },
    incentives: {
        select: {
            level: true,
            status: true
        }
    }
} satisfies Prisma.SaleSelect

export async function listSales(user: { id: string; role: string }, query: SaleListQuery) {

    let visibleCreatedByIds: string[] | null = null

    if (user.role === "SALES") {
        visibleCreatedByIds = [user.id]
    } else if (user.role === "TEAM_LEAD" || user.role === "MANAGER") {
        visibleCreatedByIds = await getDownlineUserIds(user.id)
    } else if (user.role === "OWNER_FINANCE" || user.role === "ADMIN") {
        visibleCreatedByIds = null // org-wide
    } else {
        throw HttpError.forbidden("Forbidden")
    }

    const where = buildSaleWhere({
        ...(query.search ? { search: query.search } : {}),
        ...(query.projectName ? { projectName: query.projectName } : {}),
        ...(query.fromDate ? { fromDate: query.fromDate } : {}),
        ...(query.toDate ? { toDate: query.toDate } : {}),
        ...(query.includeVoided !== undefined ? { includeVoided: query.includeVoided } : {}),
        ...(visibleCreatedByIds ? { additional: { createdById: { in: visibleCreatedByIds } } } : {})
    })

    const skip = (query.page - 1) * query.limit
    const take = query.limit
    const orderBy = buildSaleOrderBy(query.sortBy, query.sortOrder)

    const { data, total } = await prisma.$transaction(async (tx) => {

        const data = await tx.sale.findMany({
            where,
            select: saleDetailSelect,
            skip,
            take,
            orderBy
        })

        const total = await tx.sale.count({ where })

        return { data, total }
    })

    return {
        data: data.map(normalizeSaleForApi),
        total
    }
}

export async function getSaleById(user: { id: string; role: string }, saleId: string) {

    const sale = await prisma.sale.findUnique({
        where: { id: saleId },
        select: {
            id: true,
            saleCode: true,
            saleDate: true,
            bookingDate: true,
            closeDate: true,
            projectName: true,
            propertyType: true,
            unitNumber: true,
            city: true,
            state: true,
            saleValue: true,
            customerName: true,
            customerPhone: true,
            brokerChannel: true,
            notes: true,
            voidedAt: true,
            voidReason: true,
            voidedBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                }
            },
            createdAt: true,
            updatedAt: true,
            createdById: true,
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                }
            },
            incentives: {
                select: {
                    id: true,
                    level: true,
                    status: true,
                    beneficiaryUser: {
                        select: { id: true, name: true, role: true }
                    },
                    reviewer: {
                        select: { id: true, name: true, role: true }
                    }
                },
                orderBy: { level: "asc" }
            }
        } satisfies Prisma.SaleSelect
    })

    if (!sale) throw HttpError.notFound("Sale not found", { code: "SALE_NOT_FOUND" })

    if (user.role === "OWNER_FINANCE" || user.role === "ADMIN") {
        return normalizeSaleForApi(sale)
    }

    if (user.role === "SALES") {
        if (sale.createdById !== user.id) throw HttpError.forbidden("Forbidden")
        return normalizeSaleForApi(sale)
    }

    if (user.role === "TEAM_LEAD" || user.role === "MANAGER") {
        const downlineIds = await getDownlineUserIds(user.id)
        if (!downlineIds.includes(sale.createdById)) throw HttpError.forbidden("Forbidden")
        return normalizeSaleForApi(sale)
    }

    throw HttpError.forbidden("Forbidden")
}

export async function voidSale(
    saleId: string,
    actorId: string,
    reason: string
) {

    const result = await prisma.$transaction(async (tx) => {

        const sale = await tx.sale.findUnique({
            where: { id: saleId },
            select: { id: true, voidedAt: true }
        })

        if (!sale) {
            throw HttpError.notFound("Sale not found", { code: "SALE_NOT_FOUND" })
        }

        if (sale.voidedAt) {
            return tx.sale.findUnique({
                where: { id: saleId },
                select: {
                    id: true,
                    saleCode: true,
                    saleDate: true,
                    bookingDate: true,
                    closeDate: true,
                    projectName: true,
                    propertyType: true,
                    unitNumber: true,
                    city: true,
                    state: true,
                    saleValue: true,
                    customerName: true,
                    customerPhone: true,
                    brokerChannel: true,
                    notes: true,
                    voidedAt: true,
                    voidReason: true,
                    voidedBy: {
                        select: { id: true, name: true, email: true, role: true }
                    },
                    createdAt: true,
                    updatedAt: true,
                    createdById: true,
                    createdBy: {
                        select: { id: true, name: true, email: true, role: true }
                    },
                    incentives: {
                        select: { level: true, status: true },
                        orderBy: { level: "asc" }
                    }
                } satisfies Prisma.SaleSelect
            })
        }

        await tx.sale.update({
            where: { id: saleId },
            data: {
                voidedAt: new Date(),
                voidedById: actorId,
                voidReason: reason
            } satisfies Prisma.SaleUncheckedUpdateInput
        })

        const incentives = await tx.incentive.findMany({
            where: { saleId },
            select: { id: true, status: true }
        })

        if (incentives.length) {

            await tx.incentive.updateMany({
                where: { saleId, status: { not: "PAID" } },
                data: {
                    status: "ON_HOLD",
                    holdReason: `Sale voided: ${reason}`,
                    heldById: actorId
                }
            })

            for (const inc of incentives) {
                await tx.incentiveEvent.create({
                    data: {
                        incentiveId: inc.id,
                        actorUserId: actorId,
                        fromStatus: inc.status,
                        toStatus: inc.status === "PAID" ? "PAID" : "ON_HOLD",
                        reason: `Sale voided: ${reason}`,
                        metadata: {
                            type: "SALE_VOIDED"
                        }
                    }
                })
            }
        }

        return tx.sale.findUnique({
            where: { id: saleId },
            select: {
                id: true,
                saleCode: true,
                saleDate: true,
                bookingDate: true,
                closeDate: true,
                projectName: true,
                propertyType: true,
                unitNumber: true,
                city: true,
                state: true,
                saleValue: true,
                customerName: true,
                customerPhone: true,
                brokerChannel: true,
                notes: true,
                voidedAt: true,
                voidReason: true,
                voidedBy: {
                    select: { id: true, name: true, email: true, role: true }
                },
                createdAt: true,
                updatedAt: true,
                createdById: true,
                createdBy: {
                    select: { id: true, name: true, email: true, role: true }
                },
                incentives: {
                    select: { level: true, status: true },
                    orderBy: { level: "asc" }
                }
            } satisfies Prisma.SaleSelect
        })

    })

    if (!result) {
        throw HttpError.notFound("Sale not found", { code: "SALE_NOT_FOUND" })
    }

    return normalizeSaleForApi(result)

}
