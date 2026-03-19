import { prisma } from "../lib/prisma"
import { IncentiveLevel, UserRole, type Prisma } from "../generated/prisma/client"
import { IncentiveStatus } from "../generated/prisma/client"
import { calculateScoreMultiplier } from "../utils/helpers"
import type { IncentiveListQuery, SortOrder } from "../utils/pagination"
import { HttpError } from "../utils/errors.js"


const LEVEL_ORDER: IncentiveLevel[] = [
    IncentiveLevel.L1,
    IncentiveLevel.L2,
    IncentiveLevel.L3,
    IncentiveLevel.L4
]

function buildIncentiveOrderBy(sortBy: string | undefined, sortOrder: SortOrder) {
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

function buildIncentiveFilters(input: {
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

    if (input.additional) {
        and.push(input.additional)
    }

    if (input.status) {
        and.push({ status: input.status })
    }

    if (input.level) {
        and.push({ level: input.level })
    }

    if (input.userId) {
        and.push({ beneficiaryUserId: input.userId })
    }

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

    return and.length ? ({ AND: and } satisfies Prisma.IncentiveWhereInput) : ({} satisfies Prisma.IncentiveWhereInput)
}


type IncentiveWithSaleContext = {
    level: IncentiveLevel
    status: IncentiveStatus

    // for incentive detail
    holdReason?: string | null
    heldBy?: {
        id: string
        name: string
        role: UserRole
    } | null

    // for list
    sale: {
        incentives: {
            level: IncentiveLevel
            status: IncentiveStatus
            holdReason: string | null
            heldBy: {
                id: string
                name: string
                role: UserRole
            } | null
        }[]
    }
}

function computeEffectiveState(inc: IncentiveWithSaleContext) {
    const levelIndex = LEVEL_ORDER.indexOf(inc.level)
    const lowerLevels = LEVEL_ORDER.slice(0, levelIndex)

    const heldIncentive = inc.sale.incentives
        ?.filter(i =>
            lowerLevels.includes(i.level) &&
            i.status === IncentiveStatus.ON_HOLD
        )
        .sort((a, b) =>
            LEVEL_ORDER.indexOf(b.level) - LEVEL_ORDER.indexOf(a.level)
        )[0]

    const effectiveStatus =
        heldIncentive ? IncentiveStatus.ON_HOLD : inc.status

    const effectiveHoldReason =
        heldIncentive
            ? heldIncentive.holdReason
            : inc.status === IncentiveStatus.ON_HOLD
                ? inc.holdReason ?? null
                : null

    const effectiveHeldBy =
        heldIncentive
            ? heldIncentive.heldBy
            : inc.status === IncentiveStatus.ON_HOLD
                ? inc.heldBy ?? null
                : null

    return {
        effectiveStatus,
        effectiveHoldReason,
        effectiveHeldBy
    }
}

export async function getMyIncentives(userId: string, query: IncentiveListQuery) {

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    })

    if (!user) throw HttpError.notFound("User not found", { code: "USER_NOT_FOUND" })

    const ROLE_LEVEL: Record<UserRole, IncentiveLevel> = {
        SALES: IncentiveLevel.L1,
        TEAM_LEAD: IncentiveLevel.L2,
        MANAGER: IncentiveLevel.L3,
        OWNER_FINANCE: IncentiveLevel.L4,
        ADMIN: IncentiveLevel.L4
    }

    const myLevel = ROLE_LEVEL[user.role]

    if (!myLevel) {
        throw new Error("User role not mapped to incentive level")
    }

    const myIndex = LEVEL_ORDER.indexOf(myLevel)

    const previousLevel =
        myIndex > 0 ? LEVEL_ORDER[myIndex - 1] : null

    const visibilityConditions: Prisma.IncentiveWhereInput[] = []


    // higher levels only if previous approved
    if (previousLevel) {
        visibilityConditions.push({
            AND: [
                { level: myLevel },
                {
                    sale: {
                        incentives: {
                            some: {
                                level: previousLevel,
                                status: IncentiveStatus.CLAIMABLE
                            }
                        }
                    }
                }
            ]
        })
    }

    // show if lower level is ON_HOLD
    if (myIndex > 0) {
        visibilityConditions.push({
            AND: [
                { level: myLevel },
                {
                    sale: {
                        incentives: {
                            some: {
                                level: { in: LEVEL_ORDER.slice(0, myIndex) },
                                status: IncentiveStatus.ON_HOLD
                            }
                        }
                    }
                }
            ]
        })
    }

    const where = buildIncentiveFilters({
        ...(query.status ? { status: query.status } : {}),
        ...(query.level ? { level: query.level } : {}),
        ...(query.projectName ? { projectName: query.projectName } : {}),
        ...(query.fromDate ? { fromDate: query.fromDate } : {}),
        ...(query.toDate ? { toDate: query.toDate } : {}),
        ...(query.search ? { search: query.search } : {}),

        additional: {
            AND: [
                { beneficiaryUserId: userId },
                { level: myLevel },
                ...(visibilityConditions.length ? [{ OR: visibilityConditions }] : [])
            ]
        }
    })

    const skip = (query.page - 1) * query.limit
    const take = query.limit
    const orderBy = buildIncentiveOrderBy(query.sortBy, query.sortOrder)

    const { data, total } = await prisma.$transaction(async (tx) => {

        const data = await tx.incentive.findMany({
            where,
            include: {
                sale: {
                    include: {
                        incentives: {
                            select: {
                                level: true,
                                status: true,
                                holdReason: true,
                                heldBy: {
                                    select: {
                                        id: true,
                                        name: true,
                                        role: true
                                    }
                                }
                            }
                        }
                    }
                },
                reviewer: true,
                approvedBy: true,

                heldBy: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                },
            },
            skip,
            take,
            orderBy
        })

        const total = await tx.incentive.count({ where })

        return { data, total }

    })

    const enriched = data.map((inc) => {
        const state = computeEffectiveState(inc)

        return {
            ...inc,
            ...state
        }
    })

    return { data: enriched, total }

}

export async function getReviewQueue(userId: string, query: IncentiveListQuery) {
    const where = buildIncentiveFilters({
        ...(query.status ? { status: query.status } : {}),
        ...(query.level ? { level: query.level } : {}),
        ...(query.projectName ? { projectName: query.projectName } : {}),
        ...(query.userId ? { userId: query.userId } : {}),
        ...(query.fromDate ? { fromDate: query.fromDate } : {}),
        ...(query.toDate ? { toDate: query.toDate } : {}),
        ...(query.search ? { search: query.search } : {}),
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
                                        status: IncentiveStatus.CLAIMABLE
                                    }
                                }
                            }
                        },
                        {
                            sale: {
                                incentives: {
                                    none: {
                                        level: IncentiveLevel.L1,
                                        status: IncentiveStatus.ON_HOLD
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
                                        status: IncentiveStatus.CLAIMABLE
                                    }
                                }
                            }
                        },
                        {
                            sale: {
                                incentives: {
                                    none: {
                                        level: IncentiveLevel.L2,
                                        status: IncentiveStatus.ON_HOLD
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
                                        status: IncentiveStatus.CLAIMABLE
                                    }
                                }
                            }
                        },
                        {
                            sale: {
                                incentives: {
                                    none: {
                                        level: IncentiveLevel.L3,
                                        status: IncentiveStatus.ON_HOLD
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
    const orderBy = buildIncentiveOrderBy(query.sortBy, query.sortOrder)

    const { data, total } = await prisma.$transaction(async (tx) => {
        const data = await tx.incentive.findMany({
            where,
            include: {
                sale: {
                    include: {
                        incentives: {
                            select: {
                                level: true,
                                status: true,
                                holdReason: true,
                                heldBy: {
                                    select: {
                                        id: true,
                                        name: true,
                                        role: true
                                    }
                                }
                            }
                        }
                    }
                },
                beneficiaryUser: true,
                submittedBy: true,

                heldBy: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                },
            },
            skip,
            take,
            orderBy
        })

        const total = await tx.incentive.count({ where })

        return { data, total }
    })

    const enriched = data.map((inc) => {
        const state = computeEffectiveState(inc)

        return {
            ...inc,
            ...state
        }
    })

    return { data: enriched, total }

}


type ApproveInput = {
    performanceScores?: Record<string, number>
    manualOverrideAmount?: number
    reason?: string
}


export async function approveIncentive(
    incentiveId: string,
    actorId: string,
    input?: ApproveInput
) {

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {

        const incentive = await tx.incentive.findUnique({
            where: { id: incentiveId },
            include: {
                reviewer: {
                    select: { role: true }
                }
            }
        })

        if (!incentive) {
            throw HttpError.notFound("Incentive not found", { code: "INCENTIVE_NOT_FOUND" })
        }

        if (incentive.reviewerUserId !== actorId) {
            throw HttpError.forbidden("You are not the assigned reviewer", { code: "NOT_ASSIGNED_REVIEWER" })
        }


        const REVIEW_ROLE_BY_LEVEL: Record<IncentiveLevel, string> = {
            L1: "TEAM_LEAD",
            L2: "MANAGER",
            L3: "OWNER_FINANCE",
            L4: "OWNER_FINANCE"
        }

        const reviewerRole = incentive.reviewer.role

        if (reviewerRole !== REVIEW_ROLE_BY_LEVEL[incentive.level]) {
            throw HttpError.forbidden("Reviewer role not allowed for this incentive level", { code: "REVIEWER_ROLE_NOT_ALLOWED" })
        }

        if (incentive.status === IncentiveStatus.ON_HOLD) {
            throw HttpError.badRequest("Held incentive must be reopened before approval", { code: "INCENTIVE_ON_HOLD" })
        }

        if (incentive.status !== IncentiveStatus.PENDING_REVIEW) {
            throw HttpError.badRequest("Incentive not in review state", { code: "INCENTIVE_NOT_IN_REVIEW" })
        }

        const index = LEVEL_ORDER.indexOf(incentive.level)

        const lowerLevels = LEVEL_ORDER.slice(0, index)

        const holdExists = await tx.incentive.findFirst({
            where: {
                saleId: incentive.saleId,
                status: IncentiveStatus.ON_HOLD,
                level: {
                    in: lowerLevels
                }
            }
        })

        if (holdExists) {
            throw HttpError.badRequest("Sale has a held incentive. Resolve hold before approval.", { code: "SALE_HAS_HELD_INCENTIVE" })
        }


        // calculate incentive based on permance
        const multiplier = calculateScoreMultiplier(input?.performanceScores)

        const base = Number(incentive.baseAmount)

        const adjusted = Math.floor(base * multiplier)

        const finalAmount =
            input?.manualOverrideAmount ?? adjusted


        // update incentive in db
        const updated = await tx.incentive.update({
            where: { id: incentiveId },
            data: {
                performanceScore: multiplier,
                scoreMultiplier: multiplier,

                adjustedAmount: BigInt(adjusted),

                manualOverrideAmount:
                    input?.manualOverrideAmount !== undefined
                        ? BigInt(input.manualOverrideAmount)
                        : null,

                manualOverrideReason: input?.reason ?? null,

                finalAmount: BigInt(finalAmount),

                status: IncentiveStatus.CLAIMABLE,
                approvedById: actorId,
                approvedAt: new Date()
            }
        })


        // log to event as full breakdown
        await tx.incentiveEvent.create({
            data: {
                incentiveId,
                actorUserId: actorId,
                fromStatus: incentive.status,
                toStatus: IncentiveStatus.CLAIMABLE,
                reason: 'Approved after review',
                metadata: {
                    type: "APPROVED",
                    performanceScores: input?.performanceScores ?? null,
                    multiplier,
                    adjustedAmount: adjusted,
                    manualOverride: input?.manualOverrideAmount ?? null
                }
            }
        })

        return updated

    })

}


export async function holdIncentive(
    incentiveId: string,
    actorId: string,
    reason: string
) {

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {

        const incentive = await tx.incentive.findUnique({
            where: { id: incentiveId }
        })

        if (!incentive) {
            throw HttpError.notFound("Incentive not found", { code: "INCENTIVE_NOT_FOUND" })
        }

        if (incentive.reviewerUserId !== actorId) {
            throw HttpError.forbidden("You are not the assigned reviewer", { code: "NOT_ASSIGNED_REVIEWER" })
        }

        if (incentive.status !== IncentiveStatus.PENDING_REVIEW) {
            throw HttpError.badRequest("Only pending incentives can be held", { code: "INCENTIVE_NOT_PENDING" })
        }

        if (!reason?.trim()) {
            throw HttpError.badRequest("Hold reason required", { code: "HOLD_REASON_REQUIRED" })
        }

        const updated = await tx.incentive.update({
            where: { id: incentiveId },
            data: {
                status: IncentiveStatus.ON_HOLD,
                holdReason: reason.trim(),
                heldById: actorId,
            }
        })

        await tx.incentiveEvent.create({
            data: {
                incentiveId,
                actorUserId: actorId,
                fromStatus: incentive.status,
                toStatus: IncentiveStatus.ON_HOLD,
                reason: "Held after review"
            }
        })

        return updated
    })

}


export async function reopenIncentive(
    incentiveId: string,
    actorId: string
) {

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {

        const incentive = await tx.incentive.findUnique({
            where: { id: incentiveId }
        })

        if (!incentive) {
            throw HttpError.notFound("Incentive not found", { code: "INCENTIVE_NOT_FOUND" })
        }

        if (incentive.status !== IncentiveStatus.ON_HOLD) {
            throw HttpError.badRequest("Only held incentives can be reopened", { code: "INCENTIVE_NOT_HELD" })
        }

        if (incentive.heldById !== actorId) {
            throw HttpError.forbidden("Only the user who placed the hold can reopen it", { code: "ONLY_HOLDER_CAN_REOPEN" })
        }

        if (incentive.reviewerUserId !== actorId) {
            throw HttpError.forbidden("Only the assigned reviewer can reopen it", { code: "NOT_ASSIGNED_REVIEWER" })
        }

        const updated = await tx.incentive.update({
            where: { id: incentiveId },
            data: {
                status: IncentiveStatus.PENDING_REVIEW,
                holdReason: null,
                heldById: null
            }
        })

        await tx.incentiveEvent.create({
            data: {
                incentiveId,
                actorUserId: actorId,
                fromStatus: incentive.status,
                toStatus: IncentiveStatus.PENDING_REVIEW,
                reason: "Reopened for review"
            }
        })

        return updated
    })

}


export async function claimIncentive(
    incentiveId: string,
    actorId: string,
    payload: {
        bankAccountNumber?: string
        bankIfscCode?: string
        bankAccountName?: string
        upiId?: string
        note?: string
    }
) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {

        if (!payload.bankAccountNumber && !payload.upiId) {
            throw HttpError.badRequest("Provide bank details or UPI", { code: "PAYMENT_DETAILS_REQUIRED" })
        }

        const incentive = await tx.incentive.findUnique({
            where: { id: incentiveId }
        })

        if (!incentive) {
            throw HttpError.notFound("Incentive not found", { code: "INCENTIVE_NOT_FOUND" })
        }

        if (incentive.beneficiaryUserId !== actorId) {
            throw HttpError.forbidden("Not allowed to claim this incentive", { code: "NOT_ALLOWED" })
        }

        if (incentive.status !== IncentiveStatus.CLAIMABLE) {
            throw HttpError.badRequest("Incentive not claimable", { code: "INCENTIVE_NOT_CLAIMABLE" })
        }

        const updated = await tx.incentive.update({
            where: { id: incentiveId },
            data: {
                claimRequestedAt: new Date(),
                status: IncentiveStatus.CLAIM_REQUESTED,

                bankAccountNumber: payload.bankAccountNumber ?? null,
                bankIfscCode: payload.bankIfscCode ?? null,
                bankAccountName: payload.bankAccountName ?? null,
                upiId: payload.upiId ?? null,
                claimNote: payload.note ?? null
            }
        })

        await tx.incentiveEvent.create({
            data: {
                incentiveId,
                actorUserId: actorId,
                fromStatus: incentive.status,
                toStatus: IncentiveStatus.CLAIM_REQUESTED,
                metadata: {
                    type: "CLAIM_REQUESTED"
                },
                reason: "Claim requested"
            }
        })

        return updated

    })
}


export async function markPaid(
    incentiveId: string,
    actorId: string
) {

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {

        const incentive = await tx.incentive.findUnique({
            where: { id: incentiveId }
        })

        if (!incentive) {
            throw HttpError.notFound("Incentive not found", { code: "INCENTIVE_NOT_FOUND" })
        }
        if (incentive.status === IncentiveStatus.PAID) {
            throw HttpError.badRequest("Incentive already paid", { code: "INCENTIVE_ALREADY_PAID" })
        }

        if (incentive.status !== IncentiveStatus.CLAIM_REQUESTED) {
            throw HttpError.badRequest("Only claimed incentives can be paid", { code: "INCENTIVE_NOT_CLAIM_REQUESTED" })
        }

        if (!incentive.claimRequestedAt) {
            throw HttpError.badRequest("Incentive not claimed yet", { code: "INCENTIVE_NOT_CLAIMED_YET" })
        }

        const updated = await tx.incentive.update({
            where: { id: incentiveId },
            data: {
                status: IncentiveStatus.PAID,
                paidAt: new Date()
            }
        })

        await tx.incentiveEvent.create({
            data: {
                incentiveId,
                actorUserId: actorId,
                fromStatus: incentive.status,
                toStatus: IncentiveStatus.PAID,
                reason: "Payment completed",
                metadata: {
                    type: "PAID"
                }
            }
        })

        return updated

    })
}


export async function getIncentiveDetails(
    incentiveId: string,
    actorId: string
) {

    const incentive = await prisma.incentive.findUnique({

        where: { id: incentiveId },

        include: {

            sale: {
                include: {
                    incentives: {
                        select: {
                            level: true,
                            status: true,
                            holdReason: true,
                            heldBy: {
                                select: {
                                    id: true,
                                    name: true,
                                    role: true
                                }
                            }
                        }
                    }
                }
            },

            rule: true,

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
            },

            submittedBy: {
                select: {
                    id: true,
                    name: true,
                    role: true
                }
            },

            heldBy: {
                select: {
                    id: true,
                    name: true,
                    role: true,
                }
            },

            approvedBy: {
                select: {
                    id: true,
                    name: true,
                    role: true
                }
            },

            events: {
                include: {
                    actorUser: {
                        select: {
                            id: true,
                            name: true,
                            role: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "asc"
                }
            }

        }

    })

    if (!incentive) {
        throw HttpError.notFound("Incentive not found", { code: "INCENTIVE_NOT_FOUND" })
    }

    // access control
    if (
        incentive.beneficiaryUserId !== actorId &&
        incentive.reviewerUserId !== actorId
    ) {
        throw HttpError.forbidden("Not allowed to view this incentive", { code: "NOT_ALLOWED" })
    }

    const state = computeEffectiveState(incentive)

    return {
        ...incentive,
        ...state
    }
}
