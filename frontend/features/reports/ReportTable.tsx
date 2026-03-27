"use client"

import { useQuery } from "@tanstack/react-query"
import { getIncentiveReports } from "@/services/reports.api"
import { buildQuery } from "@/hooks/usePagination"
import type { Incentive, PaginationResponse } from "@/types/api.types"
import DataTable from "@/components/ui/DataTable"
import StatusBadge from "@/components/ui/StatusBadge"
import { formatCurrency } from "@/lib/format"
import { exportSingleIncentive } from "@/lib/exportSingle"
import DataTableSkeleton from "@/components/ui/DataTableSkeleton"
import EmptyState from "@/components/ui/EmptyState"
import { getErrorMessage } from "@/lib/getErrorMessage"
import { useToast } from "@/providers/ToastProvider"

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

  const { toast } = useToast()
  const query = buildQuery(queryParams)

  const { data, isLoading, isError, error, refetch } = useQuery<PaginationResponse<Incentive>>({
    queryKey: ["reports", queryParams],
    queryFn: () => getIncentiveReports(query)
  })

  if (isLoading) {
    return (
      <DataTableSkeleton columns={6} rows={8} />
    )
  }

  if (isError) {
    return (
      <EmptyState
        title="Couldn’t load reports"
        description={getErrorMessage(error)}
        action={<button onClick={() => refetch()}>Retry</button>}
      />
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <EmptyState
        title="No reports found"
        description="Try adjusting your filters."
      />
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
                onClick={() => {
                  exportSingleIncentive(row)
                  toast({ title: "Exported report", variant: "success" })
                }}
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
