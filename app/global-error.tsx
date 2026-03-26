"use client"

import { useEffect } from "react"

export default function GlobalError({
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
    <html lang="en">
      <body className="bg-background text-foreground">
        <div className="mx-auto flex min-h-screen max-w-2xl items-center p-6">
          <div className="w-full rounded-xl border border-border bg-surface p-6">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="mt-2 text-sm text-muted">
              An unexpected error occurred. Try again, or refresh the page.
            </p>
            {error?.digest && (
              <p className="mt-3 text-xs text-muted">
                Error ID: {error.digest}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <button onClick={() => reset()} className="bg-primary text-white border-primary">
                Try again
              </button>
              <button onClick={() => window.location.reload()}>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

