"use client"

import { useState } from "react"
import type { ClaimPayload } from "@/types/api.types"

type Props = {
    open: boolean
    onClose: () => void
    onSubmit: (data: ClaimPayload) => void
    loading?: boolean
}

export default function ClaimModal({
    open,
    onClose,
    onSubmit,
    loading = false
}: Props) {

    const [mode, setMode] = useState<"BANK" | "UPI">("BANK")

    const [form, setForm] = useState<ClaimPayload>({
        bankAccountNumber: "",
        bankIfscCode: "",
        bankAccountName: "",
        upiId: "",
        note: ""
    })

    if (!open) return null

    const isValid =
        mode === "UPI"
            ? !!form.upiId?.trim()
            : !!(
                form.bankAccountName?.trim() &&
                form.bankAccountNumber?.trim() &&
                form.bankIfscCode?.trim()
            )

    function handleSubmit() {
        if (!isValid) return

        onSubmit({
            ...form,
            ...(mode === "UPI"
                ? {
                    bankAccountName: undefined,
                    bankAccountNumber: undefined,
                    bankIfscCode: undefined
                }
                : { upiId: undefined })
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">

            <div className="w-full max-w-lg bg-surface border border-border rounded-xl shadow-xl flex flex-col">

                {/* HEADER */}
                <div className="p-6 border-b border-border">
                    <h2 className="text-lg font-semibold">
                        Claim Incentive
                    </h2>
                    <p className="text-sm text-muted mt-1">
                        Provide payout details for this incentive
                    </p>
                </div>

                {/* BODY */}
                <div className="p-6 space-y-5">

                    {/* Mode Toggle */}
                    <div className="flex gap-2">
                        {["BANK", "UPI"].map((m) => (
                            <button
                                key={m}
                                onClick={() => setMode(m as "BANK" | "UPI")}
                                className={`
                  px-3 py-1 text-sm border rounded-md
                  ${mode === m
                                        ? "bg-primary text-white border-primary"
                                        : "hover:bg-surface-muted"}
                `}
                            >
                                {m === "BANK" ? "Bank Account" : "UPI"}
                            </button>
                        ))}
                    </div>

                    {/* BANK FORM */}
                    {mode === "BANK" && (
                        <div className="space-y-3">

                            <input
                                placeholder="Account Holder Name"
                                className="w-full"
                                value={form.bankAccountName ?? ""}
                                onChange={(e) =>
                                    setForm(prev => ({ ...prev, bankAccountName: e.target.value }))
                                }
                            />

                            <input
                                placeholder="Account Number"
                                className="w-full"
                                value={form.bankAccountNumber ?? ""}
                                onChange={(e) =>
                                    setForm(prev => ({ ...prev, bankAccountNumber: e.target.value }))
                                }
                            />

                            <input
                                placeholder="IFSC Code"
                                className="w-full uppercase"
                                value={form.bankIfscCode ?? ""}
                                onChange={(e) =>
                                    setForm(prev => ({ ...prev, bankIfscCode: e.target.value.toUpperCase() }))
                                }
                            />

                        </div>
                    )}

                    {/* UPI FORM */}
                    {mode === "UPI" && (
                        <input
                            placeholder="UPI ID (example@upi)"
                            className="w-full"
                            value={form.upiId ?? ""}
                            onChange={(e) =>
                                setForm(prev => ({ ...prev, upiId: e.target.value }))
                            }
                        />
                    )}

                    {/* NOTE (textarea FIXED) */}
                    <div className="space-y-1">
                        <label className="text-xs text-muted">
                            Note (optional)
                        </label>

                        <textarea
                            rows={3}
                            className="w-full resize-y min-h-20"
                            placeholder="Add any notes for finance..."
                            value={form.note ?? ""}
                            onChange={(e) =>
                                setForm(prev => ({ ...prev, note: e.target.value }))
                            }
                        />
                    </div>

                </div>

                {/* FOOTER */}
                <div className="p-4 border-t border-border flex justify-end gap-2">

                    <button onClick={onClose}>
                        Cancel
                    </button>

                    <button
                        disabled={!isValid || loading}
                        onClick={handleSubmit}
                        className="bg-primary text-white border-primary hover:opacity-90 disabled:opacity-60"
                    >
                        {loading ? "Submitting..." : "Submit Claim"}
                    </button>

                </div>

            </div>
        </div>
    )
}