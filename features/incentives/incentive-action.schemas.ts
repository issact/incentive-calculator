import { z } from "zod"

export const holdReasonSchema = z
  .string()
  .trim()
  .min(3, "Hold reason is required")
  .max(500, "Hold reason is too long")

export const approvePayloadSchema = z.object({
  performanceScores: z.record(z.string(), z.number().min(1).max(5)),
  manualOverrideAmount: z.coerce.number().positive("Adjusted amount must be greater than 0").optional(),
  reason: z.string().trim().max(500, "Reason is too long").optional(),
})

export type ApprovePayloadInput = z.input<typeof approvePayloadSchema>
export type ApprovePayloadValues = z.infer<typeof approvePayloadSchema>

export const claimFormSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("BANK"),
    bankAccountName: z.string().trim().min(2, "Account holder name is required").max(120),
    bankAccountNumber: z.string().trim().min(6, "Account number is required").max(34),
    bankIfscCode: z
      .string()
      .trim()
      .min(4, "IFSC is required")
      .max(15)
      .regex(/^[A-Z0-9]+$/, "IFSC must be alphanumeric"),
    upiId: z.string().optional(),
    note: z.string().trim().max(500, "Note is too long").optional(),
  }),
  z.object({
    mode: z.literal("UPI"),
    upiId: z.string().trim().min(3, "UPI ID is required").max(120),
    bankAccountName: z.string().optional(),
    bankAccountNumber: z.string().optional(),
    bankIfscCode: z.string().optional(),
    note: z.string().trim().max(500, "Note is too long").optional(),
  }),
])

export type ClaimFormInput = z.input<typeof claimFormSchema>
export type ClaimFormValues = z.infer<typeof claimFormSchema>

