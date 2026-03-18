"use client"

import { useQuery } from "@tanstack/react-query"
import { getIncentiveReports } from "@/services/reports.api"
import { buildQuery } from "@/hooks/usePagination"
import type { Incentive, PaginationResponse } from "@/types/api.types"
import DataTable from "@/components/ui/DataTable"
import StatusBadge from "@/components/ui/StatusBadge"
import { formatCurrency } from "@/lib/format"
import { exportSingleIncentive } from "@/lib/exportSingle"

type ReportTableQueryParams = {
  page: number
  limit: number
  status?: string
  search?: string
}

export default function ReportTable({
  queryParams,
}: {
  queryParams: ReportTableQueryParams
}) {

  const query = buildQuery(queryParams)

  const { data, isLoading } = useQuery<PaginationResponse<Incentive>>({
    queryKey: ["reports", queryParams],
    queryFn: () => getIncentiveReports(query)
  })

  if (isLoading) {
    return (
      <div className="py-10 text-center text-muted">
        Loading reports...
      </div>
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="py-10 text-center text-muted">
        No reports found
      </div>
    )
  }

  return (
    <div className="mt-4">
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
              <span className="text-sm">
                {row.sale.customerName}
              </span>
            )
          },
          {
            header: "Sale Value",
            cell: (row) => (
              <span className="text-sm">
                {formatCurrency(row.saleValue)}
              </span>
            )
          },
          {
            header: "Amount",
            cell: (row) => formatCurrency(row.finalAmount)
          },
          {
            header: "Status",
            cell: (row) => (
              <StatusBadge
                status={row.effectiveStatus ?? row.status}
                subtitle={
                  row.effectiveHeldBy
                    ? `Blocked by ${row.effectiveHeldBy.name}`
                    : row.heldBy
                      ? `Blocked by ${row.heldBy.name}`
                      : undefined
                }
                title={row.effectiveHoldReason ?? undefined}
              />
            )
          },
          {
            header: "",
            cell: (row) => (
              <button
                onClick={() => exportSingleIncentive(row)}
                className="text-sm font-medium text-primary hover:text-primary-hover"
              >
                Export
              </button>
            )
          }
        ]}
      />
    </div>
  )
}
