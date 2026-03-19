"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createRule } from "@/services/admin.api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createRuleSchema, type CreateRuleFormInput, type CreateRuleFormValues } from "./admin.schemas"
import { getErrorMessage } from "@/lib/getErrorMessage"
import { useToast } from "@/providers/ToastProvider"

export default function CreateRuleForm() {

    const qc = useQueryClient()
    const { toast } = useToast()

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        reset
    } = useForm<CreateRuleFormInput, unknown, CreateRuleFormValues>({
        resolver: zodResolver(createRuleSchema),
        mode: "onChange",
        defaultValues: {
            level: "L1",
            ratePercent: 0.01
        }
    })

    const mutation = useMutation({
        mutationFn: createRule,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["rules"] })
            reset()
            toast({ title: "Rule created", variant: "success" })
        },
        onError: (err) => {
            toast({
                title: "Failed to create rule",
                description: getErrorMessage(err),
                variant: "error",
            })
        }
    })

    function onSubmit(data: CreateRuleFormValues) {
        mutation.mutate(data)
    }

    return (

        <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-4 md:grid-cols-3"
        >
            {mutation.isError && (
                <div className="md:col-span-3 rounded border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
                    {getErrorMessage(mutation.error, "Failed to create rule")}
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
                {errors.name && (
                    <span className="text-xs text-danger">
                        {errors.name.message}
                    </span>
                )}
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
                    {...register("ratePercent")}
                />

                {errors.ratePercent && (
                    <span className="text-xs text-danger">
                        {errors.ratePercent.message}
                    </span>
                )}
            </div>

            <div className="md:col-span-3 flex justify-end">
                <button
                    type="submit"
                    disabled={mutation.isPending || !isValid}
                    className="bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
                >
                    {mutation.isPending ? "Creating..." : "Create Rule"}
                </button>
            </div>

        </form>

    )
}
