import IncentiveTable from "@/features/incentives/IncentiveTable"
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
        search: typeof sp.search === "string" ? sp.search : undefined
    }

    return (

        <div>

            <h1 className="mb-6 text-xl font-semibold">
                My Incentives
            </h1>

            <Suspense fallback={<p>Loading...</p>}>
                <IncentiveTable queryParams={queryParams} />
            </Suspense>

        </div>

    )
}
