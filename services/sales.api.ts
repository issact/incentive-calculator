import { apiFetch } from "./api-client"
import type { PaginationResponse, Sale } from "@/types/api.types"

export async function createSale(data: unknown): Promise<Sale> {
  return apiFetch<Sale>("/sales", {
    method: "POST",
    body: JSON.stringify(data)
  })
}

export async function listSales(query: string): Promise<PaginationResponse<Sale>> {
  return apiFetch<PaginationResponse<Sale>>(`/sales${query}`)
}

export async function getSaleById(id: string): Promise<Sale> {
  return apiFetch<Sale>(`/sales/${id}`)
}

export async function voidSale(id: string, reason: string): Promise<Sale> {
  return apiFetch<Sale>(`/sales/${id}/void`, {
    method: "POST",
    body: JSON.stringify({ reason })
  })
}
