"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function ReloadPageButton() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleRetry = async () => {
        if (loading) return

        setLoading(true)

        try {
            router.push("/")

            // simulate slight delay for UX smoothness
            await new Promise((r) => setTimeout(r, 800))

        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleRetry}
            disabled={loading}
            className={`w-[11ch] rounded-md text-white transition cursor-pointer
                ${loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-primary hover:opacity-90"}`} >
            {loading ? "Retrying..." : "Retry"}
        </button>
    )
}