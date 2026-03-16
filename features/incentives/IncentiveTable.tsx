"use client"

import { useQuery } from "@tanstack/react-query"
import { getMyIncentives } from "@/services/incentives.api"
import { buildQuery } from "@/hooks/usePagination"
import type { Incentive, PaginationResponse } from "@/types/api.types"
import DataTable from "@/components/ui/DataTable"
import StatusBadge from "@/components/ui/StatusBadge"
import { formatCurrency } from "@/lib/format"
import Link from "next/link"

type IncentiveTableQueryParams = {
  page: number
  limit: number
  search?: string
  status?: string
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
    return (
      <div className="py-10 text-center text-muted">
        Loading incentives...
      </div>
    )
  }

  if (!data) {
    return <div>No data</div>
  }

  return (
    <div className="overflow-x-auto">
      <DataTable
        rows={data.data}
        getRowKey={(row) => row.id}
        columns={[
          {
            header: "Project",
            cell: (row) => (
              <div className="flex flex-col">
                <span className="font-medium">
                  {row.sale.projectName}
                </span>

                <span className="text-xs text-muted">
                  {row.sale.city}, {row.sale.state}
                </span>
              </div>
            )
          },

          {
            header: "Customer",
            cell: (row) => (
              <div className="text-sm">
                {row.sale.customerName}
              </div>
            )
          },

          {
            header: "Incentive",
            cell: (row) => (
              <span className="font-medium text-primary">
                {formatCurrency(row.finalAmount)}
              </span>
            )
          },

          {
            header: "Status",
            cell: (row) => (
              <StatusBadge status={row.status} />
            )
          },

          {
            header: "",
            cell: (row) => (
              <Link
                href={`/incentives/${row.id}`}
                className="text-sm font-medium text-primary hover:text-primary-hover"
              >
                View
              </Link>
            )
          }
        ]}
      />
    </div>
  )
}
