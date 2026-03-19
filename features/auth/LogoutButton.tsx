"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { logout } from "@/services/auth.api"
import { useToast } from "@/providers/ToastProvider"
import { getErrorMessage } from "@/lib/getErrorMessage"

export default function LogoutButton() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const queryClient = useQueryClient()

    async function handleLogout() {
        if (loading) return
        setLoading(true)

        try {
            await logout()
            queryClient.clear()
            toast({ title: "Logged out", variant: "success" })
        } catch (err) {
            toast({
                title: "Logout failed",
                description: getErrorMessage(err),
                variant: "error",
            })
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
