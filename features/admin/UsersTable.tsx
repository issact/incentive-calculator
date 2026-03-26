"use client"

import { useQuery } from "@tanstack/react-query"
import { getUsers } from "@/services/admin.api"
import type { User } from "@/types/api.types"
import DataTable from "@/components/ui/DataTable"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteUser } from "@/services/admin.api"
import { useState } from "react"
import EditUserModal from "./EditUserModal"
import DataTableSkeleton from "@/components/ui/DataTableSkeleton"
import EmptyState from "@/components/ui/EmptyState"
import { getErrorMessage } from "@/lib/getErrorMessage"
import { useToast } from "@/providers/ToastProvider"

function roleLabel(role: User["role"]) {
    switch (role) {
        case "SALES":
            return "Sales"
        case "TEAM_LEAD":
            return "Team Lead"
        case "MANAGER":
            return "Manager"
        case "OWNER_FINANCE":
            return "Owner"
        case "ADMIN":
            return "Admin"
        default:
            return role
    }
}

export default function UsersTable() {
    const { toast } = useToast()
    const { data, isLoading, isError, error, refetch } = useQuery<User[]>({
        queryKey: ["admin-users"],
        queryFn: getUsers,
    })

    const [editingUser, setEditingUser] = useState<User | null>(null)


    const qc = useQueryClient()


    const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-users"] })
            toast({ title: "User deactivated", variant: "success" })
        },
        onError: (err) => {
            toast({
                title: "Failed to deactivate user",
                description: getErrorMessage(err),
                variant: "error",
            })
        }
    })

    if (isLoading) {
        return <DataTableSkeleton columns={8} rows={8} />
    }

    if (isError) {
        return (
            <EmptyState
                title="Couldn’t load users"
                description={getErrorMessage(error)}
                action={<button onClick={() => refetch()}>Retry</button>}
            />
        )
    }

    if (!data?.length) {
        return (
            <EmptyState
                title="No users found"
                description="Create a user to get started."
            />
        )
    }


    return (
        <>
            <DataTable
                rows={data}
                getRowKey={(row) => row.id}
                columns={[
                    {
                        header: "Name",
                        cell: (row) => (
                            <div>
                                <div className="font-medium text-foreground">{row.name}</div>
                                <div className="text-xs text-muted">{row.email}</div>
                            </div>
                        ),
                    },
                    {
                        header: "Role",
                        cell: (row) => (
                            <span className="rounded bg-primary-soft px-2 py-1 text-xs font-medium text-primary">
                                {roleLabel(row.role)}
                            </span>
                        ),
                    },
                    {
                        header: "Status",
                        cell: (row) =>
                            row.isActive ? (
                                <span className="rounded bg-success-soft px-2 py-1 text-xs font-medium text-success">
                                    Active
                                </span>
                            ) : (
                                <span className="rounded bg-danger-soft px-2 py-1 text-xs font-medium text-danger">
                                    Inactive
                                </span>
                            ),
                    },
                    {
                        header: "Manager",
                        cell: (row) => {
                            const manager = data.find((u) => u.id === row.managerId)
                            return manager ? manager.name : "Not Assigned"
                        }
                    },
                    {
                        header: "Actions",
                        cell: (row) => (
                            <div className="flex gap-2">
                                {row.isActive ? (
                                    <>
                                        <button
                                            onClick={() => setEditingUser(row)}
                                            className="rounded bg-primary-soft px-2 py-1 text-xs font-medium text-primary"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm("Deactivate this user?")) {
                                                    deleteMutation.mutate(row.id)
                                                }
                                            }}
                                            disabled={deleteMutation.isPending}
                                            className="rounded bg-danger-soft px-2 py-1 text-xs font-medium text-danger"
                                        >
                                            {deleteMutation.isPending ? "Deactivating..." : "Deactivate"}
                                        </button>
                                    </>
                                ) : "Disabled"}
                            </div>
                        ),
                    },
                    {
                        header: "Created",
                        cell: (row) => new Date(row.createdAt).toLocaleDateString(),
                    },
                    {
                        header: "Updated",
                        cell: (row) => new Date(row.updatedAt).toLocaleDateString(),
                    },
                ]}
            />
            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    users={data}
                    onClose={() => setEditingUser(null)}
                />
            )}
        </>
    )
}
