"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createUser } from "@/services/admin.api"
import { createUserSchema, type CreateUserFormInput, type CreateUserFormValues } from "./admin.schemas"
import { getErrorMessage } from "@/lib/getErrorMessage"
import { useToast } from "@/providers/ToastProvider"
import { getApiErrorCode, getApiErrorIssues } from "@/lib/getApiErrorMeta"

export default function CreateUserForm() {

  const qc = useQueryClient()
  const { toast } = useToast()

  const form = useForm<CreateUserFormInput, unknown, CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "SALES"
    }
  })

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] })
      form.reset()
      toast({ title: "User created", variant: "success" })
    },
    onError: (err) => {
      const code = getApiErrorCode(err)
      const issues = getApiErrorIssues(err)

      if (code === "VALIDATION_ERROR" && issues?.length) {
        for (const issue of issues as Array<{ path?: unknown; message?: unknown }>) {
          const path = Array.isArray(issue.path) ? issue.path : []
          const field = typeof path[0] === "string" ? path[0] : undefined
          const message = typeof issue.message === "string" ? issue.message : "Invalid value"
          if (field) {
            form.setError(field as keyof CreateUserFormValues, { type: "server", message })
          }
        }
        toast({ title: "Please fix the highlighted fields", variant: "info" })
        return
      }

      toast({
        title: "Failed to create user",
        description: getErrorMessage(err),
        variant: "error",
      })
    }
  })

  function onSubmit(data: CreateUserFormValues) {
    mutation.mutate(data)
  }

  return (

    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid gap-4 md:grid-cols-2"
    >

      {mutation.isError && !getApiErrorIssues(mutation.error)?.length && (
        <div className="md:col-span-2 rounded border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          {getErrorMessage(mutation.error, "Failed to create user")}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <input
          autoComplete="off"
          placeholder="Full name"
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-xs text-danger">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <input
          autoComplete="off"
          placeholder="Email address"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-xs text-danger">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <input
          type="password"
          placeholder="Password"
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="text-xs text-danger">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <select {...form.register("role")}>
          <option value="SALES">Sales</option>
          <option value="TEAM_LEAD">Team Lead</option>
          <option value="MANAGER">Manager</option>
          <option value="OWNER_FINANCE">Owner</option>
        </select>
        {form.formState.errors.role && (
          <p className="text-xs text-danger">
            {form.formState.errors.role.message}
          </p>
        )}
      </div>

      <div className="md:col-span-2 flex justify-end">
        <button
          type="submit"
          disabled={mutation.isPending || !form.formState.isValid}
          className="bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          {mutation.isPending ? "Creating..." : "Create User"}
        </button>
      </div>

    </form>
  )
}
