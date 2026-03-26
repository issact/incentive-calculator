import type { Prisma } from "../../../generated/prisma/client"
import type { IncentiveLevel, IncentiveStatus } from "../../../generated/prisma/enums"


export function buildIncentiveFilters(input: {
    status?: IncentiveStatus
    level?: IncentiveLevel
    projectName?: string
    userId?: string
    fromDate?: Date
    toDate?: Date
    search?: string
    additional?: Prisma.IncentiveWhereInput
}) {
    const and: Prisma.IncentiveWhereInput[] = []

    if (input.additional) and.push(input.additional)
    if (input.status) and.push({ status: input.status })
    if (input.level) and.push({ level: input.level })
    if (input.userId) and.push({ beneficiaryUserId: input.userId })

    if (input.projectName) {
        and.push({
            sale: { projectName: { contains: input.projectName, mode: "insensitive" } }
        })
    }

    if (input.fromDate || input.toDate) {
        and.push({
            createdAt: {
                ...(input.fromDate ? { gte: input.fromDate } : {}),
                ...(input.toDate ? { lte: input.toDate } : {})
            }
        })
    }

    if (input.search) {
        and.push({
            OR: [
                { sale: { projectName: { contains: input.search, mode: "insensitive" } } },
                { sale: { customerName: { contains: input.search, mode: "insensitive" } } }
            ]
        })
    }

    return and.length ? { AND: and } : {}
}