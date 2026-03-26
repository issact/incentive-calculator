"use client"

import { useState } from "react"
import { approvePayloadSchema } from "./incentive-action.schemas"

type ScoreKey =
    | "valuation"
    | "profile"
    | "documentation"
    | "payment"

const scoreFields: [ScoreKey, string, string][] = [
    ["valuation", "Valuation Fit", "How well valuation matches market"],
    ["profile", "Customer Profile", "Buyer credibility & history"],
    ["documentation", "Documentation", "Completeness of documents"],
    ["payment", "Payment Confidence", "Likelihood of on-time payment"]
]

type ApprovePayload = {
    performanceScores: Record<ScoreKey, number>
    manualOverrideAmount?: number
    reason?: string
}

type Props = {
    open: boolean
    onClose: () => void
    onSubmit: (data: ApprovePayload) => void
    loading?: boolean
    baseAmount?: number
}

const scoreLabels = ["Poor", "Fair", "Good", "Strong", "Excellent"]

function getMultiplier(scores: Record<ScoreKey, number>): number {
    const values = Object.values(scores)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const multiplier = 1 + ((avg - 3) * 0.2)
    return Math.max(0.5, Math.min(1.5, multiplier))
}

const formatUSD = (val: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(val)

export default function ApproveModal({
    open,
    onClose,
    onSubmit,
    loading = false,
    baseAmount
}: Props) {

    const [scores, setScores] = useState<Record<ScoreKey, number>>({
        valuation: 3,
        profile: 3,
        documentation: 3,
        payment: 3
    })

    const [amount, setAmount] = useState("")
    const [reason, setReason] = useState("")
    const [fieldErrors, setFieldErrors] = useState<{ amount?: string; reason?: string }>(
        {}
    )

    if (!open) return null

    const multiplier = getMultiplier(scores)
    const delta = ((multiplier - 1) * 100).toFixed(0)

    const estimated =
        baseAmount ? Math.floor(baseAmount * multiplier) : null

    function handleSubmit() {
        const parsed = approvePayloadSchema.safeParse({
            performanceScores: scores,
            manualOverrideAmount: amount ? Number(amount) : undefined,
            reason: reason || undefined
        })

        if (!parsed.success) {
            const next: { amount?: string; reason?: string } = {}
            for (const issue of parsed.error.issues) {
                const key = issue.path[0]
                if (key === "manualOverrideAmount") next.amount = issue.message
                if (key === "reason") next.reason = issue.message
            }
            setFieldErrors(next)
            return
        }

        setFieldErrors({})
        onSubmit(parsed.data as ApprovePayload)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">

            <div className="w-full max-w-3xl max-h-[90vh] bg-surface rounded-xl shadow-xl flex flex-col border border-border">

                {/* Header */}
                <div className="p-6 border-b border-border sticky top-0 bg-surface z-10">
                    <h2 className="text-xl font-semibold">
                        Approve Incentive
                    </h2>
                    <p className="text-sm text-muted">
                        Evaluate performance and finalize payout
                    </p>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Scores */}
                    <div className="grid grid-cols-2 gap-4">

                        {scoreFields.map(([key, label, desc]) => {
                            const value = scores[key]

                            return (
                                <div key={key} className="border border-border rounded-lg p-4 space-y-3 bg-surface-muted">

                                    <div>
                                        <p className="text-sm font-medium">{label}</p>
                                        <p className="text-xs text-muted">{desc}</p>
                                    </div>

                                    <div className="flex justify-between text-[10px] text-subtle px-1">
                                        <span>Poor</span>
                                        <span>Neutral</span>
                                        <span>Excellent</span>
                                    </div>

                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((val) => {
                                            const selected = value === val

                                            let selectedStyle = ""
                                            if (selected) {
                                                if (val < 3) selectedStyle = "bg-danger text-white border-danger"
                                                else if (val === 3) selectedStyle = "bg-warning text-white border-warning"
                                                else selectedStyle = "bg-success text-white border-success"
                                            }

                                            return (
                                                <button
                                                    key={val}
                                                    onClick={() =>
                                                        setScores(prev => ({ ...prev, [key]: val }))
                                                    }
                                                    className={`
                            flex-1 h-9 text-sm border transition-all cursor-pointer
                            ${selected
                                                            ? `${selectedStyle} scale-105 shadow-sm`
                                                            : "hover:bg-surface"}
                          `}
                                                >
                                                    {val}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <p className={`text-xs font-medium
                      ${value < 3 ? "text-danger" :
                                                value === 3 ? "text-warning" :
                                                    "text-success"}
                    `}>
                                            {scoreLabels[value - 1]}
                                        </p>

                                        <p className="text-[10px] text-subtle">
                                            {value < 3
                                                ? "Below expected"
                                                : value === 3
                                                    ? "Meets baseline"
                                                    : "Above expectation"}
                                        </p>
                                    </div>

                                </div>
                            )
                        })}

                    </div>

                    {/* Impact */}
                    <div className="p-4 border border-border rounded-lg bg-surface-muted space-y-2">

                        {/* Multiplier */}
                        <div className="flex justify-between text-sm">
                            <span>Performance Impact</span>
                            <span className={`font-semibold
      ${multiplier > 1 ? "text-success" :
                                    multiplier < 1 ? "text-danger" :
                                        "text-muted"}
    `}>
                                {multiplier.toFixed(2)}x ({Number(delta) > 0 ? "+" : ""}{delta}%)
                            </span>
                        </div>

                        {/* Base */}
                        {baseAmount !== undefined && (
                            <div className="flex justify-between text-sm">
                                <span>Base Incentive</span>
                                <span className="font-semibold">
                                    {formatUSD(baseAmount)}
                                </span>
                            </div>
                        )}

                        {/* Calculated */}
                        {estimated !== null && (
                            <div className="flex justify-between text-sm">
                                <span>Calculated</span>
                                <span className="font-semibold">
                                    {formatUSD(estimated)}
                                </span>
                            </div>
                        )}

                        {/* Final */}
                        <div className="flex justify-between text-sm border-t border-border pt-2 mt-2">
                            <span className="font-medium">Final Incentive</span>
                            <span className={`font-semibold
      ${amount ? "text-success" : "text-primary"}
    `}>
                                {formatUSD(
                                    amount !== ""
                                        ? Number(amount)
                                        : estimated ?? baseAmount ?? 0
                                )}
                            </span>
                        </div>

                        {/* Override indicator */}
                        {amount && (
                            <p className="text-xs text-warning">
                                Manual override applied
                            </p>
                        )}

                    </div>

                    {/* Override */}
                    <div className="w-full">
                        <label className="text-sm space-y-2">
                            <span className="block">Adjusted Amount (optional)</span>
                            <input
                                className="w-full"
                                type="number"
                                value={amount}
                                onChange={(e) => {
                                    const val = e.target.value
                                    if (val === "") {
                                        setAmount("")
                                        setFieldErrors((prev) => ({ ...prev, amount: undefined }))
                                        return
                                    }
                                    setAmount(String(Math.max(0, Number(val))))
                                    setFieldErrors((prev) => ({ ...prev, amount: undefined }))
                                }}
                            />
                        </label>
                        {fieldErrors.amount && (
                            <p className="text-xs text-danger mt-1">
                                {fieldErrors.amount}
                            </p>
                        )}
                        <p className="text-xs text-muted mt-1">
                            Overrides final calculated incentive
                        </p>
                    </div>

                    {/* Reason */}
                    <div className="w-full">
                        <label className="text-sm space-y-2">
                            <span className="block">Reason (optional)</span>
                            <textarea
                                rows={3}
                                className="w-full resize-y"
                                value={reason}
                                onChange={(e) => {
                                    setReason(e.target.value)
                                    setFieldErrors((prev) => ({ ...prev, reason: undefined }))
                                }}
                            />
                        </label>
                        {fieldErrors.reason && (
                            <p className="text-xs text-danger mt-1">
                                {fieldErrors.reason}
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-border flex justify-end gap-2 bg-surface sticky bottom-0">

                    <button onClick={onClose}>
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-success text-white border-success hover:opacity-90 disabled:opacity-60"
                    >
                        {loading ? "Approving..." : "Proceed"}
                    </button>

                </div>

            </div>
        </div>
    )
}
