"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { saleSchema, type SaleFormInput, SaleFormValues } from "./sale.schema"
import { createSale } from "@/services/sales.api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Calendar } from "lucide-react"

export default function SaleForm() {
  const router = useRouter()
  const qc = useQueryClient()

  const form = useForm<SaleFormInput, unknown, SaleFormValues>({
    resolver: zodResolver(saleSchema),
    mode: "onChange"
  })

  const mutation = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-incentives"], exact: false })
      router.push("/incentives/my")
    },
    onError: (err: unknown) => {
      console.error(err)
    }
  })

  function onSubmit(data: SaleFormValues) {
    mutation.mutate(data)
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid gap-5 md:grid-cols-2"
    >

      {/* Sale Code */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">
          Sale Code
        </label>

        <input
          placeholder="e.g. SALE-2026-001"
          {...form.register("saleCode")}
        />
      </div>

      {/* Date */}
      <div className="flex flex-col gap-1 relative">
        <label className="text-xs font-medium text-muted">
          Sale Date
        </label>

        <input
          type="date"
          {...form.register("saleDate")}
        />

        <span className="absolute right-3 bottom-3 text-muted pointer-events-none cursor-pointer"><Calendar size={18} /></span>
      </div>

      <div className="flex flex-col gap-1 relative">
        <label className="text-xs font-medium text-muted">
          Booking Date
        </label>

        <input
          type="date"
          {...form.register("bookingDate")}
        />

        <span className="absolute right-3 bottom-3 text-muted pointer-events-none cursor-pointer"><Calendar size={18} /></span>
      </div>

      <div className="flex flex-col gap-1 relative">
        <label className="text-xs font-medium text-muted">
          Close Date
        </label>

        <input
          type="date"
          {...form.register("closeDate")}
        />

        <span className="absolute right-3 bottom-3 text-muted pointer-events-none cursor-pointer"><Calendar size={18} /></span>
      </div>

      {/* Project */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">
          Project Name
        </label>

        <input
          placeholder="Project name"
          {...form.register("projectName")}
        />

        {form.formState.errors.projectName && (
          <p className="text-xs text-danger">
            {form.formState.errors.projectName.message}
          </p>
        )}
      </div>

      {/* Property */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">
          Property Type
        </label>

        <select {...form.register("propertyType")}>
          <option value="APARTMENT">Apartment</option>
          <option value="VILLA">Villa</option>
          <option value="PLOT">Plot</option>
          <option value="COMMERCIAL">Commercial</option>
        </select>

      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">
          Unit Number
        </label>

        <input
          placeholder="Unit number"
          {...form.register("unitNumber")}
        />
      </div>

      {/* City */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">
          City
        </label>

        <input
          placeholder="City"
          {...form.register("city")}
        />

        {form.formState.errors.city && (
          <p className="text-xs text-danger">
            {form.formState.errors.city.message}
          </p>
        )}
      </div>

      {/* State */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">
          State
        </label>

        <input
          placeholder="State"
          {...form.register("state")}
        />

        {form.formState.errors.state && (
          <p className="text-xs text-danger">
            {form.formState.errors.state.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">
          Broker Channel
        </label>

        <select {...form.register("brokerChannel")}>
          <option value="DIRECT">Direct</option>
          <option value="PARTNER">Partner</option>
          <option value="BROKER">Broker</option>
        </select>
      </div>

      {/* Sale Value */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">
          Sale Value
        </label>

        <input
          type="number"
          placeholder="USD 10,00,000"
          {...form.register("saleValue", {
            valueAsNumber: true
          })}
        />

        {form.formState.errors.saleValue && (
          <p className="text-xs text-danger">
            {form.formState.errors.saleValue.message}
          </p>
        )}
      </div>

      {/* Customer */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">
          Customer Name
        </label>

        <input
          placeholder="Customer name"
          {...form.register("customerName")}
        />

        {form.formState.errors.customerName && (
          <p className="text-xs text-danger">
            {form.formState.errors.customerName.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">
          Customer Phone
        </label>

        <input
          placeholder="+91 9999999999"
          {...form.register("customerPhone")}
        />
      </div>

      <div className="md:col-span-2 flex flex-col gap-1">
        <label className="text-xs font-medium text-muted">
          Notes
        </label>

        <textarea
          rows={3}
          placeholder="Internal notes"
          {...form.register("notes")}
        />
      </div>

      {mutation.isError && (
        <div className="md:col-span-2 text-sm text-danger">
          {(mutation.error as Error).message}
        </div>
      )}

      {/* Submit */}
      <div className="md:col-span-2 flex justify-end pt-2">
        <button
          type="submit"
          disabled={mutation.isPending || !form.formState.isValid}
          className="bg-primary text-white border-primary hover:bg-primary-hover px-4 py-2 text-sm font-medium rounded-md disabled:opacity-60"
        >
          {mutation.isPending ? "Creating..." : "Create Sale"}
        </button>
      </div>

    </form>
  )
}