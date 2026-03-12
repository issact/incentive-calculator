"use client"

import { useQuery } from "@tanstack/react-query"
import { getMyIncentives } from "@/services/incentives.api"
import { buildQuery } from "@/hooks/usePagination"
import type { Incentive, PaginationResponse } from "@/types/api.types"
import DataTable from "@/components/ui/DataTable"

type IncentiveTableQueryParams = {
  page: number
  limit: number
  search?: string
}

export default function IncentiveTable({
  queryParams,
}: {
  queryParams: IncentiveTableQueryParams
}) {

  const query = buildQuery(queryParams)

  const { data, isLoading } = useQuery<PaginationResponse<Incentive>>({
    queryKey: ["my-incentives", query],
    queryFn: () => getMyIncentives(query),
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!data) {
    return <div>No data</div>
  }

  return (
    <DataTable
      rows={data.data}
      getRowKey={(row) => row.id}
      columns={[
        { header: "Project", cell: (row) => row.sale.projectName },
        { header: "Customer", cell: (row) => row.sale.customerName },
        { header: "Amount", cell: (row) => row.finalAmount },
        { header: "Status", cell: (row) => row.status },
      ]}
    />

  )
}
