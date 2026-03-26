import { apiFetch } from "./api-client"
import type { Incentive, PaginationResponse } from "@/types/api.types"

export async function getIncentiveReports(
    query: string
): Promise<PaginationResponse<Incentive>> {
    return apiFetch<PaginationResponse<Incentive>>(`/reports/incentives${query}`)
}
