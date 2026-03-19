"use client"
import { useRouter } from "next/navigation"

export default function ReloadPageButton() {

    const router = useRouter()
    return (
        <button className="bg-primary text-white border-primary" onClick={() => router.refresh()}>
            Retry
        </button>
    )
}
