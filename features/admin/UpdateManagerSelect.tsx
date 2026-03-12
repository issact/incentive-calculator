"use client"

import { useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateManager } from "@/services/admin.api"
import type { User } from "@/types/api.types"

type Props = {
  userId: string
  currentManagerId?: string | null
  users: User[]
}


export default function UpdateManagerSelect({
  userId,
  currentManagerId,
  users,
}: Props) {
  const qc = useQueryClient()

  const managerOptions = useMemo(() => {
    return users.filter((u) => u.id !== userId)
  }, [users, userId])

  const mutation = useMutation({
    mutationFn: (managerId: string) => updateManager(userId, managerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })

  return (
    <select
      value={currentManagerId ?? ""}
      onChange={(e) => mutation.mutate(e.target.value)}
      disabled={mutation.isPending}
      className="min-w-40"
    >
      <option value="">No manager</option>

      {managerOptions.map((user) => (
        <option key={user.id} value={user.id}>
          {user.name}
        </option>
      ))}
    </select>
  )
}