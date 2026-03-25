import EmptyState from "@/components/ui/EmptyState"
import { formatCurrency } from "@/lib/format"
import { getSession } from "@/lib/getSession"
import { getSaleByIdServer } from "@/services/sales.server"
import VoidSaleButton from "@/features/sales/VoidSaleButton"
import { TriangleAlert } from "lucide-react"

export default async function SaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()
  const sale = await getSaleByIdServer(id)

  if (!sale) {
    return (
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div className="rounded-lg border border-border bg-surface p-4">
          <EmptyState
            title="Sale not found"
            description="The sale may have been removed or you may not have access."
          />
        </div>
      </div>
    )
  }

  const STATUS_CONFIG = {
    PENDING_REVIEW: "text-yellow-400  border border-yellow-300",

    ON_HOLD: "text-gray-400 border border-gray-200 opacity-70",

    CLAIMABLE: "text-green-400  border border-green-300",
    CLAIM_REQUESTED: "text-blue-400  border border-blue-300",
    PAID: "text-emerald-400  border border-emerald-300",
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Sale {sale.saleCode}
          </h1>

          <div className="text-sm text-muted flex items-center gap-2">
            <span>{sale.projectName}</span>
            <span className="w-1 h-1 bg-muted rounded-full" />
            <span>
              {new Date(sale.saleDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-muted">Sale Value</div>
          <div className="text-2xl font-semibold text-primary tracking-tight">
            {formatCurrency(sale.saleValue)}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <InfoItem
            label="Customer"
            value={sale.customerName}
            sub={sale.customerPhone}
          />

          <InfoItem
            label="Location"
            value={`${sale.city}, ${sale.state}`}
          />

          <InfoItem
            label="Property"
            value={sale.propertyType}
            sub={sale.unitNumber ? `Unit ${sale.unitNumber}` : undefined}
          />

          <InfoItem
            label="Broker Channel"
            value={sale.brokerChannel ?? "-"}
          />
        </div>

        {sale.notes && (
          <div className="pt-2 border-t border-border/60">
            <div className="text-xs text-muted mb-1">Notes</div>
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {sale.notes}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium">Incentives</div>

          <div className="text-xs text-muted">
            {(sale.incentives ?? []).filter(i => i.status === "PAID").length} /{" "}
            {(sale.incentives ?? []).length} completed
          </div>
        </div>

        <div className="space-y-3">
          {(sale.incentives ?? [])
            .slice()
            .sort((a, b) => a.level.localeCompare(b.level))
            .map((inc) => (
              <div
                key={inc.level}
                className="flex items-center justify-between border border-border/60 rounded-md px-4 py-3 hover:bg-surface-hover transition"
              >
                {/* LEFT */}
                <div className="flex items-center gap-3">
                  {/* Level */}
                  <div>
                    <div className="font-medium">{inc.level}</div>
                    <div className="text-xs text-muted">
                      Incentive Level
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div
                  className={`text-xs ${STATUS_CONFIG[inc.status]} px-2 py-1 rounded-md`}
                >
                  {inc.status}
                </div>
              </div>
            ))}
        </div>
      </div>

      {sale.voidedAt ? (
        <div className="rounded-lg border border-danger/30 bg-danger-soft p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-danger">Voided</div>
              <div className="text-sm text-muted mt-1">
                {sale.voidReason ?? "No reason provided"}
              </div>
              <div className="text-xs text-muted mt-2">
                Voided on {new Date(sale.voidedAt).toLocaleString()}
                {sale.voidedBy?.name ? ` by ${sale.voidedBy.name}` : ""}
              </div>
            </div>
          </div>
        </div>
      ) : session?.user.role === "OWNER_FINANCE" ? (
        <div className="flex items-center justify-between rounded-md border border-danger/30 bg-danger-soft px-4 py-3">
          <div className="text-sm text-danger flex items-center gap-2">
            <span>
              <TriangleAlert size={20} />
            </span>
            This action is irreversible. Proceed carefully.
          </div>

          <VoidSaleButton id={id} />
        </div>
      ) : null}
    </div>
  )
}


const InfoItem = ({ label, value, sub }: {
  label?: string | null
  value?: string | null
  sub?: string | null
}) => (
  <div className="space-y-1">
    <div className="text-xs text-muted">{label}</div>
    <div className="font-medium">{value}</div>
    {sub && <div className="text-xs text-muted">{sub}</div>}
  </div>
)