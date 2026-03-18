"use client"

import { useQuery } from "@tanstack/react-query"
import { getReviewQueue } from "@/services/incentives.api"
import { buildQuery } from "@/hooks/usePagination"
import type { Incentive, PaginationResponse } from "@/types/api.types"
import DataTable from "@/components/ui/DataTable"
import StatusBadge from "@/components/ui/StatusBadge"
import { formatCurrency } from "@/lib/format"
import Link from "next/link"

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
        return (
            <div className="py-10 text-center text-muted">
                Loading incentives...
            </div>
        )
    }

    if (!data || data.data.length === 0) {
        return (
            <div className="py-10 text-center text-muted">
                No incentives pending review
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">

            <DataTable
                rows={data.data}
                getRowKey={(row) => row.id}
                columns={[

                    {
                        header: "Project",
                        cell: (row) => (
                            <div className="flex flex-col">
                                <span className="font-medium">
                                    {row.sale.projectName}
                                </span>

                                <span className="text-xs text-muted">
                                    {row.sale.city}, {row.sale.state}
                                </span>
                            </div>
                        )
                    },

                    {
                        header: "Beneficiary",
                        cell: (row) => (
                            <div className="flex flex-col">
                                <span className="text-sm">
                                    {row.beneficiaryUser.name}
                                </span>
                                <span className="text-xs text-muted">
                                    {row.beneficiaryUser.role}
                                </span>
                            </div>
                        )
                    },

                    {
                        header: "Incentive",
                        cell: (row) => (
                            <span className="font-medium text-primary">
                                {formatCurrency(row.finalAmount)}
                            </span>
                        )
                    },

                    {
                        header: "Status",
                        cell: (row) => (
                            <StatusBadge
                                status={row.effectiveStatus ?? row.status}
                                subtitle={
                                    row.effectiveHeldBy
                                        ? `Blocked by ${row.effectiveHeldBy.name}`
                                        : undefined
                                }
                                title={row.effectiveHoldReason ?? undefined}
                            />
                        )
                    },

                    {
                        header: "",
                        cell: (row) => (
                            <Link
                                href={`/incentives/${row.id}`}
                                className="text-sm font-medium text-primary hover:text-primary-hover"
                            >
                                Review
                            </Link>
                        )
                    }

                ]}
            />

        </div>
    )
}