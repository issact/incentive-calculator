import type { PaginationResponse, Sale } from "@/types/api.types"
import { apiFetchServer } from "./api-client.server"

export async function getSalesServer(
  query: string
): Promise<PaginationResponse<Sale>> {
  return apiFetchServer<PaginationResponse<Sale>>(`/sales${query}`)
}

export async function getSaleByIdServer(id: string): Promise<Sale> {
  return apiFetchServer<Sale>(`/sales/${id}`)
}

