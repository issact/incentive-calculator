"use client"

import { useQuery } from "@tanstack/react-query"
import { getIncentiveReports } from "@/services/reports.api"
import { buildQuery } from "@/hooks/usePagination"
import ExportCSVButton from "./ExportCSV"
import type { Incentive, PaginationResponse } from "@/types/api.types"
import DataTable from "@/components/ui/DataTable"

type ReportTableQueryParams = {
  page: number
  limit: number
}

export default function ReportTable({
  queryParams,
}: {
  queryParams: ReportTableQueryParams
}) {

  const query = buildQuery(queryParams)

  const { data, isLoading } = useQuery<PaginationResponse<Incentive>>({
    queryKey: ["reports", query],
    queryFn: () => getIncentiveReports(query)
  })

  if (isLoading) return <div>Loading...</div>

  if (!data) return <div>No data</div>

  return (

    <div>

      <ExportCSVButton rows={data.data} />
      <div className="mt-4">
        <DataTable
          rows={data.data}
          getRowKey={(row) => row.id}
          columns={[
            { header: "Project", cell: (row) => row.sale.projectName },
            { header: "Customer", cell: (row) => row.sale.customerName },
            { header: "User", cell: (row) => row.beneficiaryUser.name },
            { header: "Amount", cell: (row) => row.finalAmount },
            { header: "Status", cell: (row) => row.status },
          ]}
        />
      </div>

    </div>

  )
}
