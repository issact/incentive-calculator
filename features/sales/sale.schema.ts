import { z } from "zod"

export const saleSchema = z.object({

  saleCode: z.string().min(1),

  saleDate: z.string(),

  projectName: z.string(),

  propertyType: z.enum([
    "APARTMENT",
    "VILLA",
    "PLOT",
    "COMMERCIAL"
  ]),

  city: z.string(),

  state: z.string(),

  saleValue: z.coerce.number(),

  customerName: z.string(),

  customerPhone: z.string().optional(),

  brokerChannel: z.enum([
    "DIRECT",
    "PARTNER",
    "BROKER"
  ]).optional(),

  notes: z.string().optional()

})

export type SaleFormInput = z.input<typeof saleSchema>
export type SaleFormValues = z.infer<typeof saleSchema>
