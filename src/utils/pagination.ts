import { IncentiveLevel, IncentiveStatus } from "../generated/prisma/client"

export type SortOrder = "asc" | "desc"

export type IncentiveListQuery = {
    page: number
    limit: number
    sortBy?: string
    sortOrder: SortOrder
    search?: string
    status?: IncentiveStatus
    level?: IncentiveLevel
    projectName?: string
    userId?: string
    fromDate?: Date
    toDate?: Date
}

export type PaginationMeta = {
    page: number
    limit: number
    total: number
    totalPages: number
}

function firstQueryString(value: unknown): string | undefined {
    if (typeof value === "string") return value
    if (Array.isArray(value) && typeof value[0] === "string") return value[0]
    return undefined
}

function clampInt(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value))
}

function parseDateParam(value: string, endOfDay: boolean) {
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value)
    const date = dateOnly
        ? new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`)
        : new Date(value)

    if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid date")
    }

    return date
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
    return {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit)
    }
}

export function parseIncentiveListQuery(rawQuery: unknown): IncentiveListQuery {
    const query = (rawQuery ?? {}) as Record<string, unknown>

    const pageRaw = firstQueryString(query.page)
    const limitRaw = firstQueryString(query.limit)

    const page = clampInt(pageRaw ? Number.parseInt(pageRaw, 10) || 1 : 1, 1, Number.MAX_SAFE_INTEGER)
    const limit = clampInt(limitRaw ? Number.parseInt(limitRaw, 10) || 20 : 20, 1, 100)

    const sortBy = firstQueryString(query.sortBy)?.trim() || undefined

    const sortOrderRaw = firstQueryString(query.sortOrder)?.toLowerCase()
    const sortOrder: SortOrder = sortOrderRaw === "asc" ? "asc" : "desc"

    const search = firstQueryString(query.search)?.trim() || undefined
    const projectName = firstQueryString(query.projectName)?.trim() || undefined
    const userId = firstQueryString(query.userId)?.trim() || undefined

    const statusRaw = firstQueryString(query.status)?.trim()
    const status = statusRaw
        ? (Object.values(IncentiveStatus).includes(statusRaw as any) ? (statusRaw as IncentiveStatus) : undefined)
        : undefined
    if (statusRaw && !status) {
        throw new Error("Invalid status")
    }

    const levelRaw = firstQueryString(query.level)?.trim()
    const level = levelRaw
        ? (Object.values(IncentiveLevel).includes(levelRaw as any) ? (levelRaw as IncentiveLevel) : undefined)
        : undefined
    if (levelRaw && !level) {
        throw new Error("Invalid level")
    }

    const fromDateRaw = firstQueryString(query.fromDate)?.trim()
    const toDateRaw = firstQueryString(query.toDate)?.trim()

    const fromDate = fromDateRaw ? parseDateParam(fromDateRaw, false) : undefined
    const toDate = toDateRaw ? parseDateParam(toDateRaw, true) : undefined

    if (fromDate && toDate && fromDate > toDate) {
        throw new Error("fromDate must be before toDate")
    }

    return {
        page,
        limit,
        sortOrder,
        ...(sortBy ? { sortBy } : {}),
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
        ...(level ? { level } : {}),
        ...(projectName ? { projectName } : {}),
        ...(userId ? { userId } : {}),
        ...(fromDate ? { fromDate } : {}),
        ...(toDate ? { toDate } : {})
    }
}
