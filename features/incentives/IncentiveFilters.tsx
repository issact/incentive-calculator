"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

const statuses = [
    { label: "All Status", value: "" },
    { label: "Pending Review", value: "PENDING_REVIEW" },
    { label: "Claimable", value: "CLAIMABLE" },
    { label: "On Hold", value: "ON_HOLD" },
    { label: "Paid", value: "PAID" }
]

export default function IncentiveFilters() {

    const router = useRouter()
    const searchParams = useSearchParams()

    const [search, setSearch] = useState(searchParams.get("search") ?? "")

    function resetFilters() {
        router.push("/incentives/my")
    }

    return (

        <div className="flex flex-wrap items-center gap-3">

            {/* Search */}

            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search project or customer..."
                className="w-64 rounded-md border border-border bg-background px-3 py-2 text-sm"
            />


            {/* Status Filter */}

            <select
                defaultValue={searchParams.get("status") ?? ""}
                onChange={(e) => {

                    const params = new URLSearchParams(searchParams)

                    if (e.target.value)
                        params.set("status", e.target.value)
                    else
                        params.delete("status")

                    params.set("page", "1")

                    router.push(`/incentives/my?${params.toString()}`)
                }}
            >
                {statuses.map(s => (
                    <option key={s.value} value={s.value}>
                        {s.label}
                    </option>
                ))}
            </select>

            {/* Reset */}

            <button
                onClick={resetFilters}
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-surface-muted"
            >
                Reset
            </button>

        </div>
    )
}