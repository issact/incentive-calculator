"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getRules, getActiveRules } from "@/services/admin.api"
import type { IncentiveRule } from "@/types/api.types"
import DataTable from "@/components/ui/DataTable"

export default function RulesTable() {
  const [showAll, setShowAll] = useState(false)

  const { data, isLoading } = useQuery<IncentiveRule[]>({
    queryKey: ["rules", showAll],
    queryFn: showAll ? getRules : getActiveRules
  })

  if (isLoading) return <div>Loading...</div>

  if (!data) return <div>No data</div>

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
