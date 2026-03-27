import type { Incentive, PaginationResponse } from "@/types/api.types"
import { apiFetchServer } from "./api-client.server"

export async function getIncentiveReportsServer(
  query: string
): Promise<PaginationResponse<Incentive>> {
  return apiFetchServer<PaginationResponse<Incentive>>(`/reports/incentives${query}`)
}

export async function getDashboardStatsServer() {
  return apiFetchServer<{
    totalEarned: number
    claimable: number
    pendingReview: number
    paid: number
  }>("/reports/dashboard/stats")
}