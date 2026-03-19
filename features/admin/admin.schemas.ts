import { z } from "zod"

const roleValues = ["SALES", "TEAM_LEAD", "MANAGER", "OWNER_FINANCE"] as const
const levelValues = ["L1", "L2", "L3", "L4"] as const

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120, "Name is too long"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
  role: z.enum(roleValues),
})

export type CreateUserFormInput = z.input<typeof createUserSchema>
export type CreateUserFormValues = z.infer<typeof createUserSchema>

export const editUserSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120, "Name is too long"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  role: z.enum([...roleValues, "ADMIN"] as const),
  managerId: z.string().trim().optional().nullable(),
})

export type EditUserFormInput = z.input<typeof editUserSchema>
export type EditUserFormValues = z.infer<typeof editUserSchema>

export const createRuleSchema = z.object({
  level: z.enum(levelValues),
  name: z.string().trim().max(120, "Rule name is too long").optional(),
  ratePercent: z.coerce.number().min(0.01, "Rate must be between 0.01 and 100").max(100, "Rate must be between 0.01 and 100"),
})

export type CreateRuleFormInput = z.input<typeof createRuleSchema>
export type CreateRuleFormValues = z.infer<typeof createRuleSchema>
