"use client"

import { useQuery } from "@tanstack/react-query"
import { getUsers } from "@/services/admin.api"
import type { User } from "@/types/api.types"
import DataTable from "@/components/ui/DataTable"
import UpdateManagerSelect from "./UpdateManagerSelect"

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
    const { data, isLoading } = useQuery<User[]>({
        queryKey: ["admin-users"],
        queryFn: getUsers,
    })

    if (isLoading) {
        return <div className="text-sm text-muted">Loading users...</div>
    }

    if (!data?.length) {
        return <div className="text-sm text-muted">No users found.</div>
    }

    return (
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
                    cell: (row) => (
                        <UpdateManagerSelect
                            userId={row.id}
                            currentManagerId={row.managerId}
                            users={data}
                        />
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
    )
}