"use client"

import { useQuery } from "@tanstack/react-query"
import { getRules } from "@/services/admin.api"
import type { IncentiveRule } from "@/types/api.types"
import DataTable from "@/components/ui/DataTable"

export default function RulesTable() {

  const { data, isLoading } = useQuery<IncentiveRule[]>({
    queryKey: ["rules"],
    queryFn: getRules
  })

  if (isLoading) return <div>Loading...</div>

  if (!data) return <div>No data</div>

  return (
    <DataTable
      rows={data}
      getRowKey={(row) => row.id}
      columns={[
        { header: "Level", cell: (row) => row.level },
        { header: "Rule Name", cell: (row) => row.name },
        { header: "Rate %", cell: (row) => row.ratePercent },
        { header: "Active", cell: (row) => (row.isActive ? "Yes" : "No") },
        { header: "Effective From", cell: (row) => new Date(row.effectiveFrom).toLocaleDateString() },
      ]}
    />

  )
}
