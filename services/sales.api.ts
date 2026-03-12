import { apiFetch } from "./api-client"
import type { Sale } from "@/types/api.types"

export async function createSale(data: unknown): Promise<Sale> {
  return apiFetch<Sale>("/sales", {
    method: "POST",
    body: JSON.stringify(data)
  })
}
