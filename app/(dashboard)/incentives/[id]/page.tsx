import { getIncentiveDetailsServer } from "@/services/incentives.server"
import IncentiveActions from "@/features/incentives/IncentiveActions"
import EventTimeline from "@/features/incentives/EventTimeline"

export default async function IncentiveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const { id } = await params
  const incentive = await getIncentiveDetailsServer(id)

  return (

    <div className="space-y-6">

      <h1 className="text-xl font-semibold">
        Incentive Detail
      </h1>

      <div className="border p-4 space-y-2">

        <p><strong>Project:</strong> {incentive.sale.projectName}</p>

        <p><strong>Customer:</strong> {incentive.sale.customerName}</p>

        <p><strong>Level:</strong> {incentive.level}</p>

        <p><strong>Status:</strong> {incentive.status}</p>

        <p><strong>Amount:</strong> {incentive.finalAmount}</p>

      </div>

      <IncentiveActions incentive={incentive} />

      <EventTimeline events={incentive.events} />

    </div>

  )
}
