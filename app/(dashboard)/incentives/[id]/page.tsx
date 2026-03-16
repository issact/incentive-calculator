import { formatCurrency } from "@/lib/format"
import StatusBadge from "@/components/ui/StatusBadge"
import { getIncentiveDetailsServer } from "@/services/incentives.server"
import IncentiveActions from "@/features/incentives/IncentiveActions"
import EventTimeline from "@/features/incentives/EventTimeline"
import { getSession } from "@/lib/getSession"
import IncentiveBreakdown from "@/features/incentives/IncentiveBreakdown"

export default async function IncentiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const { id } = await params
  const incentive = await getIncentiveDetailsServer(id);

  const session = await getSession()
  const user = session?.user
  

  return (

    <div className="space-y-6 max-w-7xl mx-auto p-2">

      <div className="flex items-center justify-between">

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">
            Incentive Details
          </h1>

          <p className="text-sm text-muted">
            Sale {incentive.sale.saleCode} • {incentive.level} Incentive
          </p>
        </div>

        <StatusBadge status={incentive.status} />

      </div>


      {/* Info Card */}

      <div className="rounded-lg border border-border bg-surface p-6">

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          <div>
            <p className="text-xs text-muted uppercase tracking-wide">
              Sale Code
            </p>
            <p className="font-medium">
              {incentive.sale.saleCode}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted uppercase tracking-wide">
              Project
            </p>
            <p className="font-medium">
              {incentive.sale.projectName}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted uppercase tracking-wide">Customer</p>
            <p className="font-medium">{incentive.sale.customerName}</p>
          </div>

          <div>
            <p className="text-xs text-muted uppercase tracking-wide">Level</p>
            <p className="font-medium">{incentive.level}</p>
          </div>

          <div>
            <p className="text-xs text-muted uppercase tracking-wide">
              Sale Value
            </p>
            <p className="font-medium">
              {formatCurrency(incentive.sale.saleValue)}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted uppercase tracking-wide">Final Incentive Amount</p>
            <p className="font-semibold text-primary">
              {formatCurrency(incentive.finalAmount)}
            </p>
          </div>

        </div>

      </div>

      {/* Breakdown */}

      <div className="rounded-lg border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-muted">
          Incentive Breakdown
        </h2>

        <IncentiveBreakdown incentive={incentive} />
      </div>


      {/* Actions */}

      <div className="rounded-lg border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-muted">
          Available Actions
        </h2>

        <IncentiveActions incentive={incentive} user={user} />
      </div>


      {/* Timeline */}

      <div className="rounded-lg border border-border bg-surface p-4">

        <h2 className="mb-4 text-sm font-semibold text-muted">
          Activity Timeline
        </h2>

        <EventTimeline events={incentive.events} />

      </div>

    </div>

  )
}