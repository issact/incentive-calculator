export type UserRole =
    | "SALES"
    | "TEAM_LEAD"
    | "MANAGER"
    | "OWNER_FINANCE"
    | "ADMIN"

export type User = {
    id: string
    name: string
    email: string
    role: UserRole
    managerId?: string | null
    manager?: {
        id: string
        name: string
        email: string
    } | null
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export type IncentiveStatus =
    | "PENDING_REVIEW"
    | "ON_HOLD"
    | "CLAIMABLE"
    | "CLAIM_REQUESTED"
    | "PAID"

export type IncentiveLevel =
    | "L1"
    | "L2"
    | "L3"
    | "L4"

export type Sale = {
    id: string
    saleCode: string
    saleDate: string
    projectName: string
    propertyType: "APARTMENT" | "VILLA" | "PLOT" | "COMMERCIAL"
    city: string
    state: string
    saleValue: string | number
    customerName: string
    customerPhone?: string | null
    brokerChannel?: "DIRECT" | "PARTNER" | "BROKER" | null
    notes?: string | null
    incentives: {
        level: string;
        status: IncentiveStatus
    }[]
}

export type IncentiveEvent = {
    id: string
    actorUser: Pick<User, "id" | "name" | "role">
    toStatus: IncentiveStatus
    createdAt: string

    reason?: string | null

    metadata?: {
        type?: "INCENTIVE_CREATED" | "CLAIM_REQUESTED" | "APPROVED"
        performanceScores?: Record<string, number> | null
        multiplier?: number
        adjustedAmount?: number
        manualOverride?: number | null
    } | null
}

export type Incentive = {
    id: string
    saleId: string
    level: IncentiveLevel
    beneficiaryUserId: string
    reviewerUserId: string
    status: IncentiveStatus
    effectiveStatus?: IncentiveStatus

    effectiveHoldReason?: string | null
    effectiveHeldBy?: {
        id: string
        name: string
        role: UserRole
    } | null

    holdReason?: string | null
    heldBy?: {
        id: string
        name: string
        role: UserRole
    } | null
    heldById?: string | null

    finalAmount: string | number
    createdAt: string

    claimRequestedAt?: string | null
    bankAccountNumber?: string | null
    bankIfscCode?: string | null
    bankAccountName?: string | null
    upiId?: string | null
    claimNote?: string | null
    paidAt?: string | null

    sale: Pick<
        Sale,
        "id" | "projectName" | "customerName" | "city" | "state" | "saleCode"
    >
    saleValue: number

    beneficiaryUser: Pick<User, "id" | "name" | "email" | "role">


}

export type IncentiveDetail = {
    id: string
    level: IncentiveLevel
    status: IncentiveStatus
    effectiveStatus?: IncentiveStatus

    effectiveHoldReason?: string | null
    effectiveHeldBy?: {
        id: string
        name: string
        role: UserRole
    } | null

    beneficiaryUserId: string
    beneficiaryUser: {
        id: string;
        name: string;
        role: UserRole;
    };
    reviewerUserId: string
    reviewerUser: {
        id: string;
        name: string;
        role: UserRole;
    };

    holdReason?: string | null
    heldBy?: {
        id: string
        name: string
        role: UserRole
    } | null
    heldById?: string | null

    rulePercent: number
    baseAmount: string | number
    scoreMultiplier?: number
    adjustedAmount?: string | number
    manualOverrideAmount?: string | number
    manualOverrideReason?: string

    finalAmount: string | number

    claimRequestedAt?: string | null
    bankAccountNumber?: string | null
    bankIfscCode?: string | null
    bankAccountName?: string | null
    upiId?: string | null
    claimNote?: string | null
    paidAt?: string | null

    sale: Sale
    events: IncentiveEvent[]
}

export type IncentiveRule = {
    id: string
    version: number
    level: IncentiveLevel
    name: string
    ratePercent: number
    isActive: boolean
    effectiveFrom: string
}

export type Pagination = {
    page: number
    limit: number
    total: number
    totalPages: number
}

export type PaginationResponse<T> = {
    data: T[]
    pagination: Pagination
}

export type CreateRuleInput = {
    level: IncentiveLevel
    ratePercent: number
    name?: string
}

export type ClaimPayload = {
    bankAccountNumber?: string
    bankIfscCode?: string
    bankAccountName?: string
    upiId?: string
    note?: string
}