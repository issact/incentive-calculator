import { apiFetch } from "./api-client"
import type { Incentive, IncentiveDetail, PaginationResponse } from "@/types/api.types"

export async function getPaymentQueue(
    query: string
): Promise<PaginationResponse<Incentive>> {
    return apiFetch(`/incentives/payments${query}`)
}

export async function markPaid(id: string) {
    return apiFetch<IncentiveDetail>(`/incentives/${id}/pay`, { method: "POST" })
}