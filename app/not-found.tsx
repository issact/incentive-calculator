import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl items-center p-6">
      <div className="w-full rounded-xl border border-border bg-surface p-6">
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-muted">
          The page you’re looking for doesn’t exist or has moved.
        </p>
        <div className="mt-5">
          <Link href="/dashboard" className="text-sm font-medium text-primary hover:text-primary-hover">
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

