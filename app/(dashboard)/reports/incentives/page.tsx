import ReportTable from "@/features/reports/ReportTable"

export default async function ReportsPage({
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

    <div className="space-y-6 max-w-7xl mx-auto p-2">

      <h1 className="text-xl font-semibold mb-6">
        Incentive Reports
      </h1>

      <ReportTable queryParams={queryParams} />

    </div>

  )
}
