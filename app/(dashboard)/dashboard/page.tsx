import { getDashboardStatsServer, getIncentiveReportsServer } from "@/services/reports.server"
import IncentiveCharts from "@/features/dashboard/IncentiveCharts"
import StatCard from "@/components/ui/StatCard"
import { formatCurrency } from "@/lib/format"
import EmptyState from "@/components/ui/EmptyState"

export default async function DashboardPage() {

    let report: Awaited<ReturnType<typeof getIncentiveReportsServer>> | null = null
    let stats: Awaited<ReturnType<typeof getDashboardStatsServer>> | null = null

    try {
        ;[report, stats] = await Promise.all([
            getIncentiveReportsServer("?limit=50"),
            getDashboardStatsServer()
        ])
    } catch {
        return (
            <div className="space-y-6 max-w-7xl mx-auto p-2">
                <header>
                    <h1 className="text-2xl font-semibold text-foreground">
                        Dashboard
                    </h1>
                    <p className="text-sm text-muted">
                        Overview of incentive performance and payouts.
                    </p>
                </header>

                <div className="rounded-lg border border-border bg-surface p-6">
                    <EmptyState
                        title="Service unavailable"
                        description="We couldn't load dashboard data. Please check backend/DB connectivity and try again."
                    />
                </div>
            </div>
        )
    }

    return (

        <div className="space-y-6 max-w-7xl mx-auto p-2">

            <header>

                <h1 className="text-2xl font-semibold text-foreground">
                    Dashboard
                </h1>

                <p className="text-sm text-muted">
                    Overview of incentive performance and payouts.
                </p>

            </header>


            {/* KPI Cards */}

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <StatCard
                    title="Total Earned"
                    value={formatCurrency(stats.totalEarned)}
                />

                <StatCard
                    title="Claimable"
                    value={formatCurrency(stats.claimable)}
                />

                <StatCard
                    title="Pending Review"
                    value={formatCurrency(stats.pendingReview)}
                />

                <StatCard
                    title="Paid"
                    value={formatCurrency(stats.paid)}
                />

            </section>


            {/* Chart */}

            <section className="rounded-lg border border-border bg-surface p-6 min-h-90">

                <h2 className="mb-4 text-sm font-medium text-muted">
                    Incentive Trend
                </h2>

                <IncentiveCharts data={report.data} />

            </section>

        </div>
    )
}
