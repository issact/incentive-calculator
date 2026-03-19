import Skeleton from "./Skeleton"

export default function DataTableSkeleton({
  columns = 5,
  rows = 6,
}: {
  columns?: number
  rows?: number
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="border-b border-border bg-surface-muted px-4 py-3">
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((_, idx) => (
            <Skeleton key={idx} className="h-3 w-24" />
          ))}
        </div>
      </div>

      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="px-4 py-3"
          >
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {Array.from({ length: columns }).map((_, colIdx) => (
                <Skeleton
                  key={colIdx}
                  className={colIdx === 0 ? "h-4 w-40" : "h-4 w-28"}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

