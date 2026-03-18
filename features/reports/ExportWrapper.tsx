"use client"

import { useQuery } from "@tanstack/react-query"
import { getIncentiveReports } from "@/services/reports.api"
import { buildQuery } from "@/hooks/usePagination"
import ExportCSVButton from "./ExportCSV"
import type { Incentive, PaginationResponse } from "@/types/api.types"

type QueryParams = {
    page: number
    limit: number
}

export default function ExportWrapper({ queryParams }: { queryParams: QueryParams }) {
    const query = buildQuery(queryParams)

    const { data } = useQuery<PaginationResponse<Incentive>>({
        queryKey: ["reports-export", query],
        queryFn: () => getIncentiveReports(query)
    })

    if (!data) return null

    return <ExportCSVButton rows={data.data} />
}