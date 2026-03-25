import { cookies } from "next/headers"
import type { User } from "@/types/api.types"

const API_URL = process.env.API_URL!

export type Session = {
    authenticated: true
    user: User
}

export async function getSession(): Promise<Session | null> {

    const cookieStore = await cookies()

    const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
            Cookie: cookieStore.toString(),
        },
        cache: "no-store",
    })

    if (res.status === 401) {
        return null
    }

    if (!res.ok) {
        // Treat backend errors as "no session" to avoid redirect loops on /login.
        return null
    }

    const user = (await res.json()) as User

    return {
        authenticated: true,
        user
    }
}
