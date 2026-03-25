import IncentiveFilters from "@/features/incentives/IncentiveFilters"
import ExportWrapper from "@/features/reports/ExportWrapper"
import ReportTable from "@/features/reports/ReportTable"
import { Suspense } from "react"
import Skeleton from "@/components/ui/Skeleton"
import DataTableSkeleton from "@/components/ui/DataTableSkeleton"

const getString = (val?: string | string[]) => {
  return typeof val === "string" ? val : undefined
}

const getFirst = (val?: string | string[]) => {
  return Array.isArray(val) ? val[0] : val
}

export default async function ReportsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {

  const sp = await searchParams

  // build query string
  const qs = new URLSearchParams()

  for (const [key, value] of Object.entries(sp)) {
    const v = getFirst(value)
    if (typeof v === "string" && v.trim()) {
      qs.set(key, v)
    }
  }

  // query params for API
  const queryParams = {
    page: Number(sp.page ?? 1),
    limit: Number(sp.limit ?? 20),
    status: getString(sp.status),
    search: getString(sp.search),
  }

  return (

    <div className="space-y-6 max-w-7xl mx-auto p-2">

      {/* HEADER */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Incentive Reports
          </h1>
          <p className="text-sm text-muted">
            View and export your incentive history
          </p>
        </div>
      </header>

      {/* ACTION BAR */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted">
          Filter, search and export your incentives
        </div>

        <Suspense fallback={null}>
          <ExportWrapper queryParams={queryParams} />
        </Suspense>
      </div>

      {/* FILTER BAR */}
      <div className="flex items-center justify-between">
        <Suspense
          fallback={
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-9 w-40" />
              <Skeleton className="h-9 w-20" />
            </div>
          }
        >
          <IncentiveFilters
            statuses={[
              { label: "All Status", value: "" },
              { label: "Claimable", value: "CLAIMABLE" },
              { label: "Claim Requested", value: "CLAIM_REQUESTED" },
              { label: "Paid", value: "PAID" }
            ]}
          />
        </Suspense>
      </div>

      {/* TABLE */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <Suspense fallback={<DataTableSkeleton columns={6} rows={8} />}>
          <ReportTable queryParams={queryParams} />
        </Suspense>
      </div>

    </div>
  )
}