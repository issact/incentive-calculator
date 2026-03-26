import type { Prisma } from "../../../generated/prisma/client"
import type { SortOrder } from "../../../generated/prisma/internal/prismaNamespace"


export function buildIncentiveOrderBy(sortBy: string | undefined, sortOrder: SortOrder) {
    switch (sortBy) {
        case "createdAt":
            return { createdAt: sortOrder } satisfies Prisma.IncentiveOrderByWithRelationInput
        case "updatedAt":
            return { updatedAt: sortOrder } satisfies Prisma.IncentiveOrderByWithRelationInput
        case "saleDate":
            return { sale: { saleDate: sortOrder } } satisfies Prisma.IncentiveOrderByWithRelationInput
        case "projectName":
            return { sale: { projectName: sortOrder } } satisfies Prisma.IncentiveOrderByWithRelationInput
        default:
            return { createdAt: "desc" } satisfies Prisma.IncentiveOrderByWithRelationInput
    }
}