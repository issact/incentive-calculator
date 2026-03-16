import { z } from "zod"

export const saleSchema = z.object({

  saleCode: z
    .string()
    .min(3, "Sale code must be at least 3 characters")
    .max(50),

  saleDate: z
    .string()
    .min(1, "Sale date is required"),

  bookingDate: z
    .string()
    .optional(),

  closeDate: z
    .string()
    .optional(),

  projectName: z
    .string()
    .min(2, "Project name is required")
    .max(120),

  propertyType: z.enum([
    "APARTMENT",
    "VILLA",
    "PLOT",
    "COMMERCIAL"
  ]),

  unitNumber: z
    .string()
    .max(50)
    .optional(),

  city: z
    .string()
    .min(2, "City is required"),

  state: z
    .string()
    .min(2, "State is required"),

  saleValue: z
    .coerce
    .number()
    .positive("Sale value must be greater than 0")
    .max(10_000_000_000),

  customerName: z
    .string()
    .min(2, "Customer name required")
    .max(120),

  customerPhone: z
    .string()
    .regex(/^[0-9+\-\s]{8,15}$/, "Invalid phone number")
    .optional(),

  brokerChannel: z
    .enum([
      "DIRECT",
      "PARTNER",
      "BROKER"
    ])
    .optional(),

  notes: z
    .string()
    .max(1000)
    .optional()

})

export type SaleFormInput = z.input<typeof saleSchema>
export type SaleFormValues = z.infer<typeof saleSchema>
