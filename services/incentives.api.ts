import { apiFetch } from "./api-client"
import type {
    Incentive,
    IncentiveDetail,
    PaginationResponse,
} from "@/types/api.types"

export async function getMyIncentives(
    query: string
): Promise<PaginationResponse<Incentive>> {
    return apiFetch<PaginationResponse<Incentive>>(`/incentives/my${query}`)
}

export async function getReviewQueue(
    query: string
): Promise<PaginationResponse<Incentive>> {
    return apiFetch<PaginationResponse<Incentive>>(`/incentives/review${query}`)
}

export async function getIncentiveDetails(id: string): Promise<IncentiveDetail> {
    return apiFetch<IncentiveDetail>(`/incentives/${id}`)
}

export async function approveIncentive(id: string) {
    return apiFetch<IncentiveDetail>(`/incentives/${id}/approve`, { method: "POST" })
}

export async function holdIncentive(id: string, reason: string) {
    return apiFetch<IncentiveDetail>(`/incentives/${id}/hold`, {
        method: "POST",
        body: JSON.stringify({ reason }),
    })
}

export async function reopenIncentive(id: string) {
    return apiFetch<IncentiveDetail>(`/incentives/${id}/reopen`, { method: "POST" })
}

export async function claimIncentive(id: string) {
    return apiFetch<IncentiveDetail>(`/incentives/${id}/claim`, { method: "POST" })
}

export async function markPaid(id: string) {
    return apiFetch<IncentiveDetail>(`/incentives/${id}/pay`, { method: "POST" })
}
