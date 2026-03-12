"use client"

import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createUser } from "@/services/admin.api"
import type { UserRole } from "@/types/api.types"

export default function CreateUserForm() {

  const qc = useQueryClient()

  type CreateUserInput = {
    name: string
    email: string
    password: string
    role: Exclude<UserRole, "ADMIN">
  }

  const form = useForm<CreateUserInput>()

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] })
      form.reset()
    }
  })

  function onSubmit(data: CreateUserInput) {
    mutation.mutate(data)
  }

  return (

    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid gap-4 md:grid-cols-2"
    >

      <input autoComplete="off"
        placeholder="Full name"
        {...form.register("name")}
      />

      <input
        autoComplete="off"
        placeholder="Email address"
        {...form.register("email")}
      />

      <input
        type="password"
        placeholder="Password"
        {...form.register("password")}
      />

      <select {...form.register("role")}>
        <option value="SALES">Sales</option>
        <option value="TEAM_LEAD">Team Lead</option>
        <option value="MANAGER">Manager</option>
        <option value="OWNER_FINANCE">Owner</option>
      </select>

      <div className="md:col-span-2 flex justify-end">
        <button
          type="submit"
          className="bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Create User
        </button>
      </div>

    </form>
  )
}