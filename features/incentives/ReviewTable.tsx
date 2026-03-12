"use client"

import { useQuery } from "@tanstack/react-query"
import { getReviewQueue } from "@/services/incentives.api"
import { buildQuery } from "@/hooks/usePagination"
import type { Incentive, PaginationResponse } from "@/types/api.types"
import DataTable from "@/components/ui/DataTable"

type ReviewTableQueryParams = {
    page: number
    limit: number
}

export default function ReviewTable({
    queryParams,
}: {
    queryParams: ReviewTableQueryParams
}) {

    const query = buildQuery(queryParams)

    const { data, isLoading } = useQuery<PaginationResponse<Incentive>>({
        queryKey: ["review-incentives", query],
        queryFn: () => getReviewQueue(query),
    })

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (!data) {
        return <div>No data</div>
    }

    return (
        <DataTable
            rows={data.data}
            getRowKey={(row) => row.id}
            columns={[
                { header: "Project", cell: (row) => row.sale.projectName },
                { header: "Beneficiary", cell: (row) => row.beneficiaryUser.name },
                { header: "Amount", cell: (row) => row.finalAmount },
                { header: "Status", cell: (row) => row.status },
            ]}
        />

    )
}
