import { apiFetch } from "./api-client"
import type { Incentive, PaginationResponse } from "@/types/api.types"

export async function getPaymentQueue(
    query: string
): Promise<PaginationResponse<Incentive>> {
    return apiFetch(`/incentives/payments${query}`)
}