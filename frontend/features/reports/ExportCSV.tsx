"use client"

import type { Incentive } from "@/types/api.types"
import { formatCurrency } from "@/lib/format"
import { useToast } from "@/providers/ToastProvider"

export default function ExportCSVButton({ rows }: { rows: Incentive[] }) {

    const { toast } = useToast()

    function escapeCSV(value: unknown) {
        if (value == null) return ""

        const str = String(value)

        // escape quotes + wrap if needed
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`
        }

        return str
    }

    function exportCSV() {

        const header = [
            "Project",
            "Customer",
            "Sale Value",
            "Amount",
            "Status",
        ]

        const body = rows.map((r) => {

            const status = r.effectiveStatus ?? r.status

            return [
                escapeCSV(r.sale.projectName),
                escapeCSV(r.sale.customerName),
                escapeCSV(formatCurrency(r.saleValue)),
                escapeCSV(formatCurrency(r.finalAmount)),
                escapeCSV(status),
            ]
        })

        const csv = [header, ...body]
            .map(row => row.join(","))
            .join("\n")

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })

        const url = URL.createObjectURL(blob)

        const a = document.createElement("a")

        a.href = url
        a.download = "my-incentives-report.csv"

        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        URL.revokeObjectURL(url)

        toast({ title: "Exported CSV", variant: "success" })
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
