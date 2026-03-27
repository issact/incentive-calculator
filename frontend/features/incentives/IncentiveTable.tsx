"use client"

import { useQuery } from "@tanstack/react-query"
import { getMyIncentives } from "@/services/incentives.api"
import { buildQuery } from "@/hooks/usePagination"
import type { Incentive, PaginationResponse } from "@/types/api.types"
import DataTable from "@/components/ui/DataTable"
import StatusBadge from "@/components/ui/StatusBadge"
import { formatCurrency } from "@/lib/format"
import Link from "next/link"
import DataTableSkeleton from "@/components/ui/DataTableSkeleton"
import EmptyState from "@/components/ui/EmptyState"
import { getErrorMessage } from "@/lib/getErrorMessage"

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

  const { data, isLoading, isError, error, refetch } = useQuery<PaginationResponse<Incentive>>({
    queryKey: ["my-incentives", query],
    queryFn: () => getMyIncentives(query),
  })

  if (isLoading) {
    return (
      <DataTableSkeleton columns={5} rows={8} />
    )
  }

  if (isError) {
    return (
      <EmptyState
        title="Couldn’t load incentives"
        description={getErrorMessage(error)}
        action={<button onClick={() => refetch()}>Retry</button>}
      />
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <EmptyState
        title="No incentives found"
        description="Try adjusting your filters."
      />
    )
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
              <StatusBadge
                status={row.effectiveStatus ?? row.status}
                subtitle={
                  row.effectiveHeldBy
                    ? `Blocked by ${row.effectiveHeldBy.name}`
                    : undefined
                }
                title={row.effectiveHoldReason ?? undefined}
              />
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
