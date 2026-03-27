

import { Incentive } from "@/types/api.types"
import { formatCurrency } from "@/lib/format"

function escapeCSV(value: unknown) {
    if (value == null) return ""

    const str = String(value)

    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`
    }

    return str
}

export function exportSingleIncentive(r: Incentive) {

    const header = ["Project", "Customer", "Sale Value", "Amount", "Status"]

    const row = [
        escapeCSV(r.sale.projectName),
        escapeCSV(r.sale.customerName),
        escapeCSV(formatCurrency(r.saleValue)),
        escapeCSV(formatCurrency(r.finalAmount)),
        escapeCSV(r.effectiveStatus ?? r.status)
    ]

    const csv = [header, row].map(r => r.join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `${r.sale.projectName}-report.csv`
    
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)
}