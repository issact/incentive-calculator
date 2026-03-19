"use client"

import { useEffect } from "react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted">
          We couldn’t load this page. Try again.
        </p>
        {error?.digest && (
          <p className="mt-3 text-xs text-muted">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-5">
          <button onClick={() => reset()} className="bg-primary text-white border-primary">
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}

