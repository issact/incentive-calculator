import type { IncentiveDetail } from "@/types/api.types"
import { apiFetchServer } from "./api-client.server"

export async function getIncentiveDetailsServer(
  id: string
): Promise<IncentiveDetail> {
  return apiFetchServer<IncentiveDetail>(`/incentives/${id}`)
}

