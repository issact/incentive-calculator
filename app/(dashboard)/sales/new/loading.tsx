import Skeleton from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2">
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
          <div className="md:col-span-2 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>
    </div>
  )
}

