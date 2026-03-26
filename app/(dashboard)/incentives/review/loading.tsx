import DataTableSkeleton from "@/components/ui/DataTableSkeleton"
import Skeleton from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-20" />
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <DataTableSkeleton columns={5} rows={8} />
      </div>
    </div>
  )
}

