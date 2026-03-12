import { getIncentiveReportsServer } from "@/services/reports.server"
import IncentiveCharts from "@/features/dashboard/IncentiveCharts"

export default async function DashboardPage() {

    const data = await getIncentiveReportsServer("?limit=50")

    return (

        <div className="space-y-8">

            <header>
                <h1 className="text-2xl font-semibold text-foreground">
                    Dashboard
                </h1>

                <p className="text-sm text-muted">
                    Overview of recent incentive activity.
                </p>
            </header>

            <section className="rounded-lg border border-border bg-surface p-6">
                <h2 className="mb-4 text-sm font-medium text-muted">
                    Incentive Trend
                </h2>

                <IncentiveCharts data={data.data} />
            </section>

        </div>

    )
}