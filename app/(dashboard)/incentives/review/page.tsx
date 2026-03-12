import ReviewTable from "@/features/incentives/ReviewTable"
import { Suspense } from "react"

export default async function ReviewPage({
    searchParams
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}) {

    const sp = await searchParams

    const queryParams = {
        page: Number(sp.page ?? 1),
        limit: Number(sp.limit ?? 20)
    }

    return (

        <div>

            <h1 className="mb-6 text-xl font-semibold">
                Review Incentives
            </h1>

            <Suspense fallback={<p>Loading...</p>}>
                <ReviewTable queryParams={queryParams} />
            </Suspense>
        </div>

    )
}
