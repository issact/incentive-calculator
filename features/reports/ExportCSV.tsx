"use client"

import type { Incentive } from "@/types/api.types"

export default function ExportCSVButton({ rows }: { rows: Incentive[] }) {

    function exportCSV() {

        const header = [
            "Project",
            "Customer",
            "User",
            "Amount",
            "Status"
        ]

        const body = rows.map((r) => [
            r.sale.projectName,
            r.sale.customerName,
            r.beneficiaryUser.name,
            r.finalAmount,
            r.status
        ])

        const csv = [header, ...body]
            .map(row => row.join(","))
            .join("\n")

        const blob = new Blob([csv], { type: "text/csv" })

        const url = URL.createObjectURL(blob)

        const a = document.createElement("a")

        a.href = url
        a.download = "incentives.csv"

        a.click()
    }

    return (
        <button
            onClick={exportCSV}
            className="border border-border bg-background px-3 py-2 text-sm hover:bg-background/60"
        >
            Export CSV
        </button>
    )
}
