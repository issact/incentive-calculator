import { IncentiveLevel, type UserRole } from "../../../generated/prisma/enums"


export const ROLE_LEVEL: Record<UserRole, IncentiveLevel> = {
    SALES: IncentiveLevel.L1,
    TEAM_LEAD: IncentiveLevel.L2,
    MANAGER: IncentiveLevel.L3,
    OWNER_FINANCE: IncentiveLevel.L4,
    ADMIN: IncentiveLevel.L4
}

export const LEVEL_ORDER: IncentiveLevel[] = [
    IncentiveLevel.L1,
    IncentiveLevel.L2,
    IncentiveLevel.L3,
    IncentiveLevel.L4
]