"use client"

import { useQuery } from "@tanstack/react-query"
import { getIncentiveReports } from "@/services/reports.api"
import { buildQuery } from "@/hooks/usePagination"
import ExportCSVButton from "./ExportCSV"
import type { Incentive, PaginationResponse } from "@/types/api.types"
import Skeleton from "@/components/ui/Skeleton"

type QueryParams = Record<string, string | number | boolean | undefined>

export default function ExportWrapper({ queryParams }: { queryParams: QueryParams }) {
    const query = buildQuery(queryParams)

    const { data, isLoading, isError } = useQuery<PaginationResponse<Incentive>>({
        queryKey: ["reports-export", query],
        queryFn: () => getIncentiveReports(query)
    })

    if (isLoading) {
        return <Skeleton className="h-9 w-28" />
    }

    if (isError) return null

    if (!data || data.data.length === 0) return null

    return <ExportCSVButton rows={data.data} />
}
