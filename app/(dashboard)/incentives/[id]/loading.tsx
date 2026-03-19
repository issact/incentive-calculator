import Skeleton from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-7 w-28" />
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 7 }).map((_, idx) => (
            <div key={idx} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}

