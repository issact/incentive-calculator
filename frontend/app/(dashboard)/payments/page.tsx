import { formatCurrency } from "@/lib/format"

import DataTable from "@/components/ui/DataTable"
import type { Incentive } from "@/types/api.types"
import Link from "next/link"
import { getPaymentQueueServer } from "@/services/payment.server"
import StatCard from "@/components/ui/StatCard"
import EmptyState from "@/components/ui/EmptyState"

export default async function PaymentsPage() {

    const res = await getPaymentQueueServer("")
    const data = res.data

    if (!data || data.length === 0) {
        return (
            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">
                        Payment Processing
                    </h1>
                </div>

                <div className="rounded-lg border border-border bg-surface p-4">
                    <EmptyState
                        title="No pending payments"
                        description="Claims will appear here once requested."
                    />
                </div>
            </div>
        )
    }

    const total = data.reduce((sum, i) => sum + Number(i.finalAmount), 0)

    const columns = [

        {
            header: "Sale",
            cell: (inc: Incentive) => (
                <div>
                    <div className="font-medium">{inc.sale.saleCode}</div>
                    <div className="text-xs text-muted">
                        {inc.sale.projectName}
                    </div>
                </div>
            )
        },

        {
            header: "User",
            cell: (inc: Incentive) => (
                <div>
                    <div>{inc.beneficiaryUser.name}</div>
                    <div className="text-xs text-muted">
                        {inc.level}
                    </div>
                </div>
            )
        },

        {
            header: "Amount",
            cell: (inc: Incentive) => (
                <span className="font-semibold text-primary">
                    {formatCurrency(inc.finalAmount)}
                </span>
            )
        },

        {
            header: "Payout Method",
            cell: (inc: Incentive) => {

                if (inc.upiId) {
                    return (
                        <div className="text-sm">
                            <div className="font-medium">UPI</div>
                            <div className="text-xs text-muted">{inc.upiId}</div>
                        </div>
                    )
                }

                return (
                    <div className="text-sm">
                        <div className="font-medium">
                            {inc.bankAccountName}
                        </div>
                        <div className="text-xs text-muted">
                            ••••{inc.bankAccountNumber?.slice(-4)}
                        </div>
                    </div>
                )
            }
        },

        {
            header: "Requested",
            cell: (inc: Incentive) => (
                <span className="text-sm text-muted">
                    {inc.claimRequestedAt
                        ? new Date(inc.claimRequestedAt).toLocaleDateString()
                        : "-"
                    }
                </span>
            )
        },

        {
            header: "",
            cell: (inc: Incentive) => (
                <Link
                    href={`/payments/${inc.id}`}
                    className="text-primary text-sm hover:underline"
                >
                    View
                </Link>
            )
        }

    ]

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">
                    Payment Processing
                </h1>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">

                <StatCard title="Pending Payments" value={data.length} />
                <StatCard title="Total Amount" value={formatCurrency(total)} />
                <StatCard title="Avg Payout" value={formatCurrency(total / (data.length || 1))} />
            </div>

            {/* Table */}
            <DataTable
                rows={data}
                columns={columns}
                getRowKey={(r) => r.id}
            />

        </div >
    )
}
