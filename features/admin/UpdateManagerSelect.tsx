"use client"

import { useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateManager } from "@/services/admin.api"
import type { User } from "@/types/api.types"

type Props = {
  userId: string
  currentManagerId?: string | null
  users: User[]
  disabled?: boolean
}

export default function UpdateManagerSelect({
  userId,
  currentManagerId,
  users,
  disabled
}: Props) {
  const qc = useQueryClient()

  const roleOrder = useMemo(() => (
    {
      SALES: 1,
      TEAM_LEAD: 2,
      MANAGER: 3,
      OWNER_FINANCE: 4,
      ADMIN: 5,
    }
  ), [])

  const managerOptions = useMemo(() => {
    const currentUser = users.find((u) => u.id === userId)
    if (!currentUser) return []

    const nextRoleLevel = roleOrder[currentUser.role] + 1

    return users.filter(
      (u) =>
        u.id !== userId &&
        u.isActive &&
        roleOrder[u.role] === nextRoleLevel
    )
  }, [users, userId, roleOrder])

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
      disabled={disabled || mutation.isPending}
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