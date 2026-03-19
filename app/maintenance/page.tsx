"use client"

export default function MaintenancePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl items-center p-6">
      <div className="w-full rounded-xl border border-border bg-surface p-6">
        <h1 className="text-xl font-semibold">Service unavailable</h1>
        <p className="mt-2 text-sm text-muted">
          The backend is not reachable right now, Please try again in a moment.
        </p>

        <div className="mt-5 flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-white border-primary"
          >
            Retry
          </button>
          <a href="/login" className="text-sm font-medium text-primary hover:text-primary-hover self-center">
            Go to login
          </a>
        </div>
      </div>
    </div>
  )
}
