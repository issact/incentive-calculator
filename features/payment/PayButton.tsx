"use client"

import { markPaid } from "@/services/payments.api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/providers/ToastProvider"
import { getErrorMessage } from "@/lib/getErrorMessage"

export default function PayButton({
    id,
    disabled
}: {
    id: string
    disabled?: boolean
}) {

    const [confirmOpen, setConfirmOpen] = useState(false)
    const { toast } = useToast()

    const qc = useQueryClient()
    const router = useRouter()

    const pay = useMutation({
        mutationFn: () => markPaid(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["payments"] })
            qc.invalidateQueries({ queryKey: ["incentive-detail", id] })
            router.refresh()
            setConfirmOpen(false)
            toast({ title: "Marked as paid", variant: "success" })
        },
        onError: (err) => {
            toast({
                title: "Payment update failed",
                description: getErrorMessage(err),
                variant: "error",
            })
        }
    })

    return (
        <>
            {/* Main Button */}
            <button
                disabled={disabled || pay.isPending}
                onClick={() => setConfirmOpen(true)}
                className={`
          px-4 py-2 rounded-md text-sm font-medium
          ${disabled
                        ? "bg-surface-muted text-muted cursor-not-allowed"
                        : "bg-success text-white hover:opacity-90"}
        `}
            >
                {pay.isPending ? "Processing..." : "Mark as Paid"}
            </button>

            {/* Confirmation Modal */}
            {confirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">

                    <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-xl">

                        {/* Header */}
                        <div className="p-5 border-b border-border">
                            <h2 className="text-lg font-semibold text-danger">
                                Confirm Payment
                            </h2>
                            <p className="text-sm text-muted mt-1">
                                This action cannot be undone.
                            </p>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-3 text-sm">

                            <p>
                                You are about to mark this incentive as <strong>PAID</strong>.
                            </p>

                            <p className="text-muted">
                                Ensure the payment has been completed externally before proceeding.
                            </p>

                            {pay.isError && (
                                <div className="rounded border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
                                    {getErrorMessage(pay.error)}
                                </div>
                            )}

                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-border flex justify-end gap-2">

                            <button
                                onClick={() => setConfirmOpen(false)}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => pay.mutate()}
                                disabled={pay.isPending}
                                className="bg-success text-white px-4 py-2 rounded-md hover:opacity-90"
                            >
                                {pay.isPending ? "Processing..." : "Confirm Payment"}
                            </button>

                        </div>

                    </div>
                </div>
            )}
        </>
    )
}
