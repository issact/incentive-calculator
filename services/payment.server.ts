
import type { Incentive, IncentiveDetail, PaginationResponse } from "@/types/api.types"
import { apiFetchServer } from "./api-client.server"

export async function getPaymentQueueServer(
    query: string
): Promise<PaginationResponse<Incentive>> {
    return apiFetchServer(`/incentives/payments${query}`)
}

export async function getPaymentDetailServer(id: string) {
    return apiFetchServer<IncentiveDetail>(`/incentives/payments/${id}`)
}