"use client"

import type { ClaimPayload } from "@/types/api.types"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { claimFormSchema, type ClaimFormInput, type ClaimFormValues } from "./incentive-action.schemas"
import { useEffect } from "react"

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

    const form = useForm<ClaimFormInput, unknown, ClaimFormValues>({
        resolver: zodResolver(claimFormSchema),
        mode: "onChange",
        defaultValues: {
            mode: "BANK",
            bankAccountName: "",
            bankAccountNumber: "",
            bankIfscCode: "",
            upiId: "",
            note: ""
        }
    })

    const mode = useWatch({ control: form.control, name: "mode" })

    useEffect(() => {
        if (open) {
            form.reset({
                mode: "BANK",
                bankAccountName: "",
                bankAccountNumber: "",
                bankIfscCode: "",
                upiId: "",
                note: ""
            })
        }
    }, [open, form])

    if (!open) return null

    function handleSubmit(values: ClaimFormValues) {
        const payload: ClaimPayload =
            values.mode === "UPI"
                ? {
                    upiId: values.upiId,
                    note: values.note || undefined,
                }
                : {
                    bankAccountName: values.bankAccountName,
                    bankAccountNumber: values.bankAccountNumber,
                    bankIfscCode: values.bankIfscCode,
                    note: values.note || undefined,
                }

        onSubmit(payload)
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
                <form noValidate onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col">
                    <div className="p-6 space-y-5">

                    {/* Mode Toggle */}
                    <div className="flex gap-2">
                        {["BANK", "UPI"].map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => form.setValue("mode", m as "BANK" | "UPI", { shouldValidate: true })}
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
                                {...form.register("bankAccountName")}
                            />
                            {form.formState.errors.bankAccountName && (
                                <p className="text-xs text-danger">
                                    {form.formState.errors.bankAccountName.message}
                                </p>
                            )}

                            <input
                                placeholder="Account Number"
                                className="w-full"
                                {...form.register("bankAccountNumber")}
                            />
                            {form.formState.errors.bankAccountNumber && (
                                <p className="text-xs text-danger">
                                    {form.formState.errors.bankAccountNumber.message}
                                </p>
                            )}

                            <input
                                placeholder="IFSC Code"
                                className="w-full uppercase"
                                {...form.register("bankIfscCode", {
                                    onChange: (e) => {
                                        form.setValue("bankIfscCode", String(e.target.value).toUpperCase(), {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        })
                                    }
                                })}
                            />
                            {form.formState.errors.bankIfscCode && (
                                <p className="text-xs text-danger">
                                    {form.formState.errors.bankIfscCode.message}
                                </p>
                            )}

                        </div>
                    )}

                    {/* UPI FORM */}
                    {mode === "UPI" && (
                        <input
                            placeholder="UPI ID (example@upi)"
                            className="w-full"
                            {...form.register("upiId")}
                        />
                    )}
                    {mode === "UPI" && form.formState.errors.upiId && (
                        <p className="text-xs text-danger">
                            {form.formState.errors.upiId.message}
                        </p>
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
                            {...form.register("note")}
                        />
                        {form.formState.errors.note && (
                            <p className="text-xs text-danger">
                                {form.formState.errors.note.message}
                            </p>
                        )}
                    </div>

                    </div>

                    {/* FOOTER */}
                    <div className="p-4 border-t border-border flex justify-end gap-2">

                    <button type="button" onClick={onClose}>
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={!form.formState.isValid || loading}
                        className="bg-primary text-white border-primary hover:opacity-90 disabled:opacity-60"
                    >
                        {loading ? "Submitting..." : "Submit Claim"}
                    </button>

                    </div>
                </form>

            </div>
        </div>
    )
}
