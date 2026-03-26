"use client"

import { useState } from "react"
import { holdReasonSchema } from "./incentive-action.schemas"

const reasons = [
    "Missing required property documents",
    "Valuation mismatch needs review",
    "Payment reliability risk flagged",
    "Compliance verification required",
    "Other"
]

export default function HoldModal({
    open,
    onClose,
    onSubmit,
    loading
}: {
    open: boolean
    onClose: () => void
    onSubmit: (reason: string) => void
    loading?: boolean
}) {

    const [selected, setSelected] = useState(reasons[0])
    const [custom, setCustom] = useState("")
    const [error, setError] = useState<string | null>(null)

    if (!open) return null

    const finalReason =
        selected === "Other"
            ? custom
            : custom
                ? `${selected} — ${custom}`
                : selected

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">

            <div className="w-full max-w-lg rounded-xl border border-border bg-surface shadow-lg">

                {/* Header */}

                <div className="p-6 border-b border-border">

                    <h2 className="text-lg font-semibold">
                        Hold Incentive
                    </h2>

                    <p className="text-sm text-muted mt-1">
                        Select a reason and optionally add custom text.
                    </p>

                </div>


                {/* Body */}

                <div className="p-6 space-y-4">

                    {reasons.map((reason) => (

                        <label
                            key={reason}
                            className="flex items-center gap-3 text-sm cursor-pointer"
                        >

                            <input
                                type="radio"
                                name="holdReason"
                                value={reason}
                                checked={selected === reason}
                                onChange={() => setSelected(reason)}
                            />

                            {reason}

                        </label>

                    ))}


                    {/* Custom text */}

                    <textarea
                        placeholder="Optional custom hold reason"
                        value={custom}
                        onChange={(e) => setCustom(e.target.value)}
                        rows={3}
                        className="w-full"
                    />

                    {error && (
                        <p className="text-xs text-danger">
                            {error}
                        </p>
                    )}

                </div>


                {/* Footer */}

                <div className="flex justify-end gap-3 border-t border-border p-4">

                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm hover:bg-surface-muted"
                    >
                        Cancel
                    </button>

                    <button
                        disabled={loading || !finalReason.trim()}
                        onClick={() => {
                            const parsed = holdReasonSchema.safeParse(finalReason)
                            if (!parsed.success) {
                                setError(parsed.error.issues[0]?.message ?? "Please enter a valid hold reason")
                                return
                            }
                            setError(null)
                            onSubmit(parsed.data)
                        }}
                        className="bg-warning text-white border-warning hover:opacity-90 px-4 py-2 text-sm rounded-md"
                    >
                        {loading ? "Submitting..." : "Submit Hold"}
                    </button>

                </div>

            </div>

        </div>

    )
}
