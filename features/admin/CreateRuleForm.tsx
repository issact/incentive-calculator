"use client"

import { useForm } from "react-hook-form"
import { createRule } from "@/services/admin.api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { IncentiveLevel } from "@/types/api.types"
import { Calendar } from "lucide-react"

export default function CreateRuleForm() {

    const qc = useQueryClient()

    type CreateRuleInput = {
        level: IncentiveLevel
        ratePercent: number
        effectiveFrom: string
        name?: string;
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<CreateRuleInput>({
        defaultValues: {
            level: "L1",
            ratePercent: 0
        }
    })

    const mutation = useMutation({
        mutationFn: createRule,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["rules"] })
            reset()
        }
    })

    function onSubmit(data: CreateRuleInput) {
        mutation.mutate(data)
    }

    return (

        <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-4 md:grid-cols-3"
        >
            {mutation.isError && (
                <div className="md:col-span-3 rounded border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
                    {(mutation.error as Error).message || "Failed to create rule"}
                </div>
            )}

            <div className="flex flex-col gap-1">
                <label htmlFor="level" className="text-xs font-medium text-muted">
                    Level
                </label>

                <select id="level" {...register("level")}>
                    <option value="L1">L1</option>
                    <option value="L2">L2</option>
                    <option value="L3">L3</option>
                    <option value="L4">L4</option>
                </select>
            </div>

            <div className="flex flex-col gap-1">
                <label htmlFor="name" className="text-xs font-medium text-muted">
                    Rule Name (optional)
                </label>

                <input
                    id="name"
                    placeholder={`example rule`}
                    {...register("name")}
                />
            </div>

            <div className="flex flex-col gap-1">
                <label htmlFor="ratePercent" className="text-xs font-medium text-muted">
                    Rate (%)
                </label>

                <input
                    id="ratePercent"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 12.5"
                    {...register("ratePercent", {
                        required: true,
                        valueAsNumber: true,
                        min: 0.01,
                        max: 100
                    })}
                />

                {errors.ratePercent && (
                    <span className="text-xs text-danger">
                        Rate must be between 0.01 and 100
                    </span>
                )}
            </div>


            <div className="flex flex-col gap-1 relative">
                <label htmlFor="effectiveFrom" className="text-xs font-medium text-muted">
                    Effective From
                </label>

                <input
                    id="effectiveFrom"
                    type="date"
                    {...register("effectiveFrom", { required: true })}
                />
                <span className="absolute right-3 bottom-3 text-muted pointer-events-none cursor-pointer"><Calendar size={18} /></span>

                {errors.effectiveFrom && (
                    <span className="text-xs text-danger absolute -bottom-6 left-2">
                        Effective date is required
                    </span>
                )}
            </div>


            <div className="md:col-span-3 flex justify-end">
                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
                >
                    {mutation.isPending ? "Creating..." : "Create Rule"}
                </button>
            </div>

        </form>

    )
}