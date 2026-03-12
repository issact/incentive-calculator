"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { logout } from "@/services/auth.api"

export default function LogoutButton() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleLogout() {
        if (loading) return
        setLoading(true)

        try {
            await logout()
        } finally {
            router.push("/login")
            router.refresh()
        }
    }

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className="border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-background/60"
        >
            {loading ? "Logging out..." : "Logout"}
        </button>
    )
}
