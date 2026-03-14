"use client"

import { useForm, useWatch } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateUser } from "@/services/admin.api"
import type { User, UserRole } from "@/types/api.types"

type Props = {
    user: User
    users: User[]
    onClose: () => void
}

type FormInput = {
    name: string
    email: string
    role: UserRole
    managerId: string | null
}

const roleOrder: Record<UserRole, number> = {
    SALES: 1,
    TEAM_LEAD: 2,
    MANAGER: 3,
    OWNER_FINANCE: 4,
    ADMIN: 5
}

export default function EditUserModal({ user, users, onClose }: Props) {

    const qc = useQueryClient()

    const form = useForm<FormInput>({
        defaultValues: {
            name: user.name,
            email: user.email,
            role: user.role,
            managerId: user.managerId ?? null
        }
    })

    const role = useWatch({
        control: form.control,
        name: "role"
    })

    const mutation = useMutation({
        mutationFn: (data: FormInput) => updateUser(user.id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-users"] })
            onClose()
        }
    })

    const availableManagers = users.filter(
        (u) =>
            u.id !== user.id &&
            u.isActive &&
            roleOrder[u.role] === roleOrder[role] + 1
    )

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-xl bg-surface p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >

                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-foreground">
                        Edit User
                    </h2>
                    <p className="text-sm text-muted">
                        Update user details and reporting hierarchy.
                    </p>
                </div>

                <form
                    onSubmit={form.handleSubmit((data) =>
                        mutation.mutate({
                            ...data,
                            managerId: data.managerId || null
                        })
                    )}
                    className="space-y-4"
                >

                    {/* Name */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted">
                            Full Name
                        </label>
                        <input
                            className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
                            {...form.register("name", { required: true })}
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted">
                            Email
                        </label>
                        <input
                            className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
                            {...form.register("email", { required: true })}
                        />
                    </div>

                    {/* Role */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted">
                            Role
                        </label>
                        <select
                            className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
                            {...form.register("role")}
                        >
                            <option value="SALES">Sales</option>
                            <option value="TEAM_LEAD">Team Lead</option>
                            <option value="MANAGER">Manager</option>
                            <option value="OWNER_FINANCE">Owner</option>
                        </select>
                    </div>

                    {/* Manager */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted">
                            Manager
                        </label>
                        <select
                            className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
                            {...form.register("managerId")}
                        >
                            <option value="">No manager</option>

                            {availableManagers.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name}
                                </option>
                            ))}
                        </select>

                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded border border-border px-4 py-2 text-sm"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="rounded bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                            {mutation.isPending ? "Saving..." : "Save Changes"}
                        </button>

                    </div>

                </form>

            </div>
        </div>
    )
}