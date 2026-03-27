"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

type PaginationProps = {
    page: number
    totalPages: number
}

export default function Pagination({ page, totalPages }: PaginationProps) {

    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    function go(p: number) {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", String(p))
        router.push(`${pathname}?${params.toString()}`)
    }

    return (

        <div className="mt-4 flex items-center gap-2">

            <button
                className="px-3 py-2 text-sm"
                disabled={page <= 1}
                onClick={() => go(page - 1)}
            >
                Prev
            </button>

            <span className="text-sm text-muted">
                Page {page} / {totalPages}
            </span>

            <button
                className="px-3 py-2 text-sm"
                disabled={page >= totalPages}
                onClick={() => go(page + 1)}
            >
                Next
            </button>

        </div>

    )
}
