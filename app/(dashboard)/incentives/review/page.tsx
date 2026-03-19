import ReviewTable from "@/features/incentives/ReviewTable"
import IncentiveFilters from "@/features/incentives/IncentiveFilters"
import { Suspense } from "react"
import Skeleton from "@/components/ui/Skeleton"
import DataTableSkeleton from "@/components/ui/DataTableSkeleton"

export default async function ReviewPage({
    searchParams
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}) {

    const sp = await searchParams

    const queryParams = {
        page: Number(sp.page ?? 1),
        limit: Number(sp.limit ?? 20),
        search: typeof sp.search === "string" ? sp.search : undefined,
        status: typeof sp.status === "string" ? sp.status : undefined
    }

    const REVIEW_STATUSES = [
        { label: "All Status", value: "" },
        { label: "Pending Review", value: "PENDING_REVIEW" },
        { label: "On Hold", value: "ON_HOLD" },
    ]

    return (

        <div className="space-y-6 max-w-7xl mx-auto p-2">

            {/* Header */}

            <div className="flex items-center justify-between">

                <div>
                    <h1 className="text-2xl font-semibold">
                        Review Incentives
                    </h1>

                    <p className="text-sm text-muted mt-1">
                        Approve, hold, or review submitted incentives
                    </p>
                </div>

            </div>


            {/* Filters */}

            <div className="flex items-center justify-between">
                <Suspense
                    fallback={
                        <div className="flex flex-wrap items-center gap-3">
                            <Skeleton className="h-9 w-64" />
                            <Skeleton className="h-9 w-40" />
                            <Skeleton className="h-9 w-20" />
                        </div>
                    }
                >
                    <IncentiveFilters statuses={REVIEW_STATUSES} />
                </Suspense>
            </div>
            
            {/* Table */}

            <div className="rounded-xl border border-border bg-surface p-4">

                <Suspense fallback={<DataTableSkeleton columns={5} rows={8} />}>
                    <ReviewTable queryParams={queryParams} />
                </Suspense>

            </div>

        </div>
    )
}
