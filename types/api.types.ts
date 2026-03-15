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
    manager: {
        id: string;
        name: string;
        email: string;
    }
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

export type IncentiveStatus =
    | "PENDING_REVIEW"
    | "ON_HOLD"
    | "CLAIMABLE"
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
}

export type IncentiveEvent = {
    id: string
    actorUser: Pick<User, "id" | "name">
    toStatus: IncentiveStatus
    createdAt: string
}

export type Incentive = {
    id: string
    saleId: string
    level: IncentiveLevel
    beneficiaryUserId: string
    reviewerUserId: string
    status: IncentiveStatus
    finalAmount: string | number
    createdAt: string
    claimRequestedAt?: string | null
    sale: Pick<Sale, "id" | "projectName" | "customerName">
    beneficiaryUser: Pick<User, "id" | "name" | "email" | "role">
}

export type IncentiveDetail = {
    id: string
    level: IncentiveLevel
    status: IncentiveStatus
    finalAmount: string | number
    claimRequestedAt?: string | null
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
    effectiveFrom: string
    name?: string
}
