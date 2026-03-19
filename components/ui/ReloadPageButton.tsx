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
            router.refresh()

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
            className={`px-4 py-2 rounded-md text-white transition cursor-pointer
                ${loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-primary hover:opacity-90"
                }`}
        >
            {loading ? "Retrying..." : "Retry"}
        </button>
    )
}