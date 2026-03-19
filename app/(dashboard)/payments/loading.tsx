import DataTableSkeleton from "@/components/ui/DataTableSkeleton"
import Skeleton from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <Skeleton className="h-7 w-52" />

      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="rounded-lg border border-border bg-surface p-4 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-28" />
          </div>
        ))}
      </div>

      <DataTableSkeleton columns={6} rows={8} />
    </div>
  )
}

