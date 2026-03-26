"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getRules, getActiveRules } from "@/services/admin.api"
import type { IncentiveRule } from "@/types/api.types"
import DataTable from "@/components/ui/DataTable"
import DataTableSkeleton from "@/components/ui/DataTableSkeleton"
import EmptyState from "@/components/ui/EmptyState"
import { getErrorMessage } from "@/lib/getErrorMessage"

export default function RulesTable() {
  const [showAll, setShowAll] = useState(false)

  const { data, isLoading, isError, error, refetch } = useQuery<IncentiveRule[]>({
    queryKey: ["rules", showAll],
    queryFn: showAll ? getRules : getActiveRules
  })

  if (isLoading) return <DataTableSkeleton columns={6} rows={8} />

  if (isError) {
    return (
      <EmptyState
        title="Couldn’t load rules"
        description={getErrorMessage(error)}
        action={<button onClick={() => refetch()}>Retry</button>}
      />
    )
  }

  if (!data?.length) {
    return (
      <EmptyState
        title="No rules found"
        description={showAll ? "No rule history available." : "No active rules available."}
      />
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">

        <div className="text-sm text-muted">
          {showAll ? "Showing rule history" : "Showing active rules"}
        </div>

        <button
          onClick={() => setShowAll((v) => !v)}
          className="text-sm rounded border border-border px-3 py-1 hover:bg-surface-hover"
        >
          {showAll ? "Show Active Only" : "Show All Rules"}
        </button>

      </div>

      <DataTable
        rows={data}
        getRowKey={(row) => row.id}
        columns={[
          { header: "Level", cell: (row) => row.level },
          { header: "Version", cell: (row) => row.version },
          { header: "Rule Name", cell: (row) => row.name },
          { header: "Rate %", cell: (row) => row.ratePercent },
          {
            header: "Active", cell: (row) => (row.isActive ?
              <span className="text-success font-medium">Active</span>
              :
              <span className="text-muted">Inactive</span>
            )
          },
          { header: "Effective From", cell: (row) => new Date(row.effectiveFrom).toLocaleDateString() },
        ]}
      />
    </>

  )
}
