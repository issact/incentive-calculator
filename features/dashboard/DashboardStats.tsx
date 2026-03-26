import { formatCurrency } from "@/lib/format"
import type { Incentive } from "@/types/api.types"

export default function DashboardStats({ data }: { data: Incentive[] }) {

    const total = data.reduce((sum, i) => sum + Number(i.finalAmount), 0)

    const claimable = data
        .filter(i => i.status === "CLAIMABLE")
        .reduce((sum, i) => sum + Number(i.finalAmount), 0)

    const pending = data
        .filter(i => i.status === "PENDING_REVIEW")
        .reduce((sum, i) => sum + Number(i.finalAmount), 0)

    const paid = data
        .filter(i => i.status === "PAID")
        .reduce((sum, i) => sum + Number(i.finalAmount), 0)

    return (

        <div className="grid gap-4 sm:grid-cols-4">

            <Stat title="Total Earned" value={formatCurrency(total)} />
            <Stat title="Claimable" value={formatCurrency(claimable)} />
            <Stat title="Pending Review" value={formatCurrency(pending)} />
            <Stat title="Paid" value={formatCurrency(paid)} />

        </div>
    )
}

function Stat({ title, value }: { title: string; value: string }) {

    return (

        <div className="rounded-lg border border-border bg-surface p-4">

            <p className="text-xs uppercase tracking-wide text-muted">
                {title}
            </p>

            <p className="mt-1 text-xl font-semibold">
                {value}
            </p>

        </div>
    )
}