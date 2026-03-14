import { apiFetch } from "./api-client"
import type { IncentiveRule, User } from "@/types/api.types"

export async function getUsers(): Promise<User[]> {
    return apiFetch<User[]>("/admin/users")
}

export async function createUser(data: unknown): Promise<User> {
    return apiFetch<User>("/admin/users", {
        method: "POST",
        body: JSON.stringify(data)
    })
}

export async function updateUser(
    userId: string,
    data: Partial<User>
): Promise<User> {
    return apiFetch<User>(`/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}

export async function updateManager(
    userId: string,
    managerId: string
): Promise<User> {
    return apiFetch<User>(`/admin/users/${userId}/manager`, {
        method: "PATCH",
        body: JSON.stringify({ managerId })
    })
}

export async function getRules(): Promise<IncentiveRule[]> {
    return apiFetch<IncentiveRule[]>("/admin/incentive-rules")
}

export async function createRule(data: unknown): Promise<IncentiveRule> {
    return apiFetch<IncentiveRule>("/admin/incentive-rules", {
        method: "POST",
        body: JSON.stringify(data)
    })
}


export async function deleteUser(userId: string): Promise<{ success: boolean }> {
    return apiFetch(`/admin/users/${userId}`, {
        method: "DELETE"
    })
}