import type { ReactNode } from "react"

export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="py-14 text-center">
      <div className="mx-auto max-w-md space-y-2">
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="text-sm text-muted">{description}</p>
        )}
        {action && (
          <div className="pt-2">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}

