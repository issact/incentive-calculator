import Skeleton from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="rounded-lg border border-border bg-surface p-4 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-28" />
          </div>
        ))}
      </div>

      <div className="border border-border bg-surface rounded-lg p-5 space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  )
}

