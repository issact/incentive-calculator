"use client"

import { voidSale } from "@/services/sales.api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/providers/ToastProvider"
import { getErrorMessage } from "@/lib/getErrorMessage"

export default function VoidSaleButton({ id, disabled }: { id: string; disabled?: boolean }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [reason, setReason] = useState("")

  const { toast } = useToast()
  const qc = useQueryClient()
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: () => voidSale(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"], exact: false })
      qc.invalidateQueries({ queryKey: ["sale-detail", id] })
      router.refresh()
      setConfirmOpen(false)
      setReason("")
      toast({ title: "Sale voided", variant: "success" })
    },
    onError: (err) => {
      toast({
        title: "Failed to void sale",
        description: getErrorMessage(err),
        variant: "error",
      })
    },
  })

  const reasonValid = reason.trim().length >= 3

  return (
    <>
      <button
        disabled={disabled || mutation.isPending}
        onClick={() => setConfirmOpen(true)}
        className={`px-4 py-2 rounded-md text-sm font-medium ${
          disabled ? "bg-surface-muted text-muted cursor-not-allowed" : "bg-danger text-white hover:opacity-90"
        }`}
      >
        {mutation.isPending ? "Voiding..." : "Void Sale"}
      </button>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-xl">
            <div className="p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-danger">Confirm Void</h2>
              <p className="text-sm text-muted mt-1">Voiding blocks all incentive actions for this sale.</p>
            </div>

            <div className="p-5 space-y-3 text-sm">
              <label className="text-xs font-medium text-muted">Reason</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why is this sale being voided?"
              />

              {!reasonValid ? (
                <div className="text-xs text-danger">Reason must be at least 3 characters.</div>
              ) : null}

              {mutation.isError ? (
                <div className="rounded border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
                  {getErrorMessage(mutation.error)}
                </div>
              ) : null}
            </div>

            <div className="p-4 border-t border-border flex justify-end gap-2">
              <button onClick={() => setConfirmOpen(false)}>Cancel</button>
              <button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending || !reasonValid}
                className="bg-danger text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-60"
              >
                {mutation.isPending ? "Voiding..." : "Confirm Void"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

