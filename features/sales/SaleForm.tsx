"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { saleSchema, type SaleFormInput, SaleFormValues } from "./sale.schema"
import { createSale } from "@/services/sales.api"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

export default function SaleForm() {

  const router = useRouter()

  const form = useForm<SaleFormInput, unknown, SaleFormValues>({
    resolver: zodResolver(saleSchema)
  })

  const mutation = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      router.push("/incentives/my")
    }
  })

  function onSubmit(data: SaleFormValues) {
    mutation.mutate(data)
  }

  return (

    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4 max-w-lg"
    >

      <input
        placeholder="Sale Code"
        {...form.register("saleCode")}
      />

      <input
        type="date"
        {...form.register("saleDate")}
      />

      <input
        placeholder="Project Name"
        {...form.register("projectName")}
      />

      <select {...form.register("propertyType")}>

        <option value="APARTMENT">Apartment</option>
        <option value="VILLA">Villa</option>
        <option value="PLOT">Plot</option>
        <option value="COMMERCIAL">Commercial</option>

      </select>

      <input placeholder="City" {...form.register("city")} />

      <input placeholder="State" {...form.register("state")} />

      <input
        placeholder="Sale Value"
        type="number"
        {...form.register("saleValue")}
      />

      <input
        placeholder="Customer Name"
        {...form.register("customerName")}
      />

      <button type="submit">
        Create Sale
      </button>

    </form>

  )
}
