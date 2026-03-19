"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"

type ToastVariant = "success" | "error" | "info"

export type ToastInput = {
  title: string
  description?: string
  variant?: ToastVariant
  durationMs?: number
}

type ToastItem = ToastInput & {
  id: string
  createdAt: number
  variant: ToastVariant
  durationMs: number
}

type ToastContextValue = {
  toast: (input: ToastInput) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

function variantClasses(variant: ToastVariant) {
  switch (variant) {
    case "success":
      return "border-success/30 bg-success-soft text-success"
    case "error":
      return "border-danger/30 bg-danger-soft text-danger"
    case "info":
    default:
      return "border-border bg-surface text-foreground"
  }
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef(new Map<string, number>())

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) window.clearTimeout(timer)
    timers.current.delete(id)
  }, [])

  const toast = useCallback((input: ToastInput) => {
    const id = crypto.randomUUID()
    const item: ToastItem = {
      id,
      title: input.title,
      description: input.description,
      variant: input.variant ?? "info",
      durationMs: input.durationMs ?? 3500,
      createdAt: Date.now(),
    }

    setToasts((prev) => [item, ...prev].slice(0, 5))

    const timer = window.setTimeout(() => remove(id), item.durationMs)
    timers.current.set(id, timer)
  }, [remove])

  useEffect(() => {
    const timersMap = timers.current
    return () => {
      for (const timer of timersMap.values()) window.clearTimeout(timer)
      timersMap.clear()
    }
  }, [])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed left-1/2 -translate-x-1/2 top-4 z-100 flex w-90 max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-lg border px-4 py-3 shadow-sm ${variantClasses(t.variant)}`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium leading-5">
                  {t.title}
                </p>
                {t.description && (
                  <p className="mt-1 text-sm text-muted">
                    {t.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => remove(t.id)}
                className="rounded-md px-2 py-1 text-sm hover:bg-black/5"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return ctx
}
