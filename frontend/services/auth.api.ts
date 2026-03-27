import { apiFetch } from "./api-client";
import type { User } from "@/types/api.types"

export async function login(
    email: string,
    password: string
): Promise<{ authenticated: boolean; user: User }> {
    return apiFetch<{ authenticated: boolean; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
    })
}


export async function logout(): Promise<void> {
    return apiFetch<void>("/auth/logout", {
        method: "POST",
    })
}
