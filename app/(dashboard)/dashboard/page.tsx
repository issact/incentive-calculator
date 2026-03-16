import { getDashboardStatsServer, getIncentiveReportsServer } from "@/services/reports.server"
import IncentiveCharts from "@/features/dashboard/IncentiveCharts"
import StatCard from "@/components/ui/StatCard"
import { formatCurrency } from "@/lib/format"

export default async function DashboardPage() {

    const [report, stats] = await Promise.all([
        getIncentiveReportsServer("?limit=50"),
        getDashboardStatsServer()
    ])

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

            <section className="rounded-lg border border-border bg-surface p-6">

                <h2 className="mb-4 text-sm font-medium text-muted">
                    Incentive Trend
                </h2>

                <IncentiveCharts data={report.data} />

            </section>

        </div>
    )
}