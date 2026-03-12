import { cookies } from "next/headers"
import type { User } from "@/types/api.types"

const API_URL = process.env.NEXT_PUBLIC_API_URL!

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

    const user = (await res.json()) as User

    return {
        authenticated: true,
        user
    }
}
