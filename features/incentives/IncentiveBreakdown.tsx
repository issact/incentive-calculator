import { formatCurrency } from "@/lib/format"
import type { IncentiveDetail } from "@/types/api.types"

export default function IncentiveBreakdown({
    incentive
}: {
    incentive: IncentiveDetail
}) {

    return (

        <div className="rounded-lg border border-border bg-surface p-4 space-y-4 mt-2">

            <div className="grid gap-4 text-sm">

                <Row
                    label="Sale Value"
                    value={formatCurrency(incentive.sale.saleValue)}
                />

                <Row
                    label="Rule Percent"
                    value={`${incentive.rulePercent}%`}
                />

                <Divider />

                <Row
                    label="Base Amount"
                    value={formatCurrency(incentive.baseAmount)}
                />

                {incentive.scoreMultiplier && (
                    <Row
                        label="Performance Multiplier"
                        value={`${incentive.scoreMultiplier}x`}
                    />
                )}

                {incentive.adjustedAmount && (
                    <Row
                        label="Adjusted Amount"
                        value={formatCurrency(incentive.adjustedAmount)}
                    />
                )}

                {incentive.manualOverrideAmount && (
                    <Row
                        label="Manual Override"
                        value={formatCurrency(incentive.manualOverrideAmount)}
                    />
                )}

                <Divider />

                <Row
                    label="Final Incentive"
                    value={
                        <span className="font-semibold text-primary">
                            {formatCurrency(incentive.finalAmount)}
                        </span>
                    }
                />

            </div>

        </div>

    )
}

function Row({
    label,
    value
}: {
    label: string
    value: React.ReactNode
}) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-muted">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    )
}

function Divider() {
    return <div className="border-t border-border" />
}