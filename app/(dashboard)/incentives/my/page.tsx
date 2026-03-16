import IncentiveTable from "@/features/incentives/IncentiveTable"
import IncentiveFilters from "@/features/incentives/IncentiveFilters"
import { Suspense } from "react"

export default async function MyIncentivesPage({
    searchParams
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}) {

    const sp = await searchParams

    const queryParams = {
        page: Number(sp.page ?? 1),
        limit: Number(sp.limit ?? 20),
        search: typeof sp.search === "string" ? sp.search : undefined,
        status: typeof sp.status === "string" ? sp.status : undefined,
    }

    return (

        <div className="space-y-6">

            <header className="flex items-center justify-between">

                <div>
                    <h1 className="text-2xl font-semibold">
                        My Incentives
                    </h1>

                    <p className="text-sm text-muted">
                        Track your earned incentives and claimable payouts
                    </p>
                </div>

            </header>


            {/* FILTER BAR */}

            <div className="flex items-center justify-between">
                <IncentiveFilters />
            </div>


            {/* TABLE */}

            <div className="rounded-lg border border-border bg-surface p-4">

                <Suspense fallback={<p>Loading incentives...</p>}>
                    <IncentiveTable queryParams={queryParams} />
                </Suspense>

            </div>

        </div>
    )
}