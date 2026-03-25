import DataTable from "@/components/ui/DataTable"
import EmptyState from "@/components/ui/EmptyState"
import { formatCurrency } from "@/lib/format"
import { getSalesServer } from "@/services/sales.server"
import type { IncentiveStatus, Sale } from "@/types/api.types"
import Link from "next/link"

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const qs = new URLSearchParams()
  const includeVoided =
    (typeof sp.includeVoided === "string" && ["1", "true", "yes"].includes(sp.includeVoided.toLowerCase())) ||
    (Array.isArray(sp.includeVoided) && typeof sp.includeVoided[0] === "string" && ["1", "true", "yes"].includes(sp.includeVoided[0].toLowerCase()))

  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string" && value.trim()) qs.set(key, value)
    if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) qs.set(key, value[0])
  }

  const query = qs.toString() ? `?${qs.toString()}` : ""

  const toggleQs = new URLSearchParams(qs)
  if (includeVoided) toggleQs.delete("includeVoided")
  else toggleQs.set("includeVoided", "true")
  const toggleHref = toggleQs.toString() ? `/sales?${toggleQs.toString()}` : "/sales"

  const res = await getSalesServer(query)
  const data = res.data ?? []

  const buildStatusCubes = (cube: {
    level: string;
    status: IncentiveStatus;
  }) => {

    const colorsAndLabels = {
      PENDING_REVIEW: {
        bg: "bg-yellow-100 text-yellow-800",
        label: "Pending Review",
      },
      ON_HOLD: {
        bg: "bg-gray-200 text-gray-700",
        label: "On Hold",
      },
      CLAIMABLE: {
        bg: "bg-green-100 text-green-800",
        label: "Claimable",
      },
      CLAIM_REQUESTED: {
        bg: "bg-blue-100 text-blue-800",
        label: "Claim Requested",
      },
      PAID: {
        bg: "bg-emerald-200 text-emerald-900",
        label: "Paid",
      },
    }

    const config = colorsAndLabels[cube.status]

    return (
      <div key={cube.level} className="group relative cursor-default">
        <div className={`rounded px-2 py-1 ${config.bg}`}>
          {cube.level}
        </div>

        <div className="absolute hidden group-hover:block bottom-full mb-1 text-xs bg-surface text-fg border border-border px-2 py-1 rounded whitespace-nowrap">
          {config.label} at {cube.level}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Sales</h1>
          <Link
            href={toggleHref}
            className="text-sm text-primary hover:underline"
          >
            {includeVoided ? "Hide voided" : "Show voided"}
          </Link>
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <EmptyState
            title="No sales found"
            description="Sales will appear here once created."
          />
        </div>
      </div>
    )
  }

  const columns = [
    {
      header: "Sale",
      cell: (sale: Sale) => (
        <div className="flex items-center justify-between">
          <div className="font-medium">
            <span>{sale.saleCode}</span>
            <div className="text-xs text-muted">{sale.projectName}</div>
          </div>
          {sale.voidedAt ? (
            <span className="text-[10px] px-2 py-0.5 rounded bg-danger-soft text-danger border border-danger/30">
              VOIDED
            </span>
          ) : null}
        </div>
      ),
    },
    {
      header: "Customer",
      cell: (sale: Sale) => (
        <div>
          <div>{sale.customerName}</div>
          <div className="text-xs text-muted">
            {sale.city}, {sale.state}
          </div>
        </div>
      ),
    },
    {
      header: "Value",
      cell: (sale: Sale) => (
        <span className="font-semibold text-primary">
          {formatCurrency(sale.saleValue)}
        </span>
      ),
    },
    {
      header: "Date",
      cell: (sale: Sale) => (
        <span className="text-sm text-muted">
          {new Date(sale.saleDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Incentive Status",
      cell: (sale: Sale) => (
        <div className="text-xs text-muted flex items-center gap-2">
          {(sale.incentives ?? [])
            .slice()
            .sort((a, b) => a.level.localeCompare(b.level))
            .map((i) => buildStatusCubes(i)) || "-"}
        </div>
      ),
    },
    {
      header: "",
      cell: (sale: Sale) => (
        <Link
          href={`/sales/${sale.id}`}
          className="text-primary text-sm hover:underline"
        >
          View
        </Link>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sales</h1>
        <Link
          href={toggleHref}
          className="text-sm text-primary hover:underline"
        >
          {includeVoided ? "Hide voided" : "Show voided"}
        </Link>
      </div>

      <DataTable rows={data} columns={columns} getRowKey={(r) => r.id} />
    </div>
  )
}
