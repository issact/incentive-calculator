import { z } from "zod"

export const createSaleSchema = z.object({
    saleCode: z.string().min(3),
    saleDate: z.string(),

    projectName: z.string().min(2),

    propertyType: z.enum([
        "APARTMENT",
        "VILLA",
        "PLOT",
        "COMMERCIAL"
    ]),

    unitNumber: z.string().optional(),

    city: z.string(),
    state: z.string(),

    saleValue: z.number().positive(),

    customerName: z.string(),
    customerPhone: z.string().optional(),

    brokerChannel: z
        .enum(["DIRECT", "PARTNER", "BROKER"])
        .optional(),

    bookingDate: z.string().optional(),
    closeDate: z.string().optional(),

    notes: z.string().optional()
})