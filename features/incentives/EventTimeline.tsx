import type { IncentiveEvent, IncentiveStatus } from "@/types/api.types"

export default function EventTimeline({ events }: { events: IncentiveEvent[] }) {
  if (!events.length) {
    return (
      <p className="text-sm text-muted">
        No activity recorded yet.
      </p>
    )
  }

  const statusColor: Record<IncentiveStatus, string> = {
    PENDING_REVIEW: "bg-warning",
    CLAIMABLE: "bg-success",
    CLAIM_REQUESTED: "bg-blue-400/50",
    ON_HOLD: "bg-danger",
    PAID: "bg-accent"
  }

  function getEventMessage(event: IncentiveEvent) {

    const type = event.metadata?.type

    if (type === "INCENTIVE_CREATED") {
      return "Incentive generated"
    }

    if (type === "CLAIM_REQUESTED") {
      return `${event.actorUser.name} requested payout`
    }

    if (type === "APPROVED") {
      return `${event.actorUser.name} approved incentive`
    }

    if (type === "PAID") {
      return `${event.actorUser.name} completed payment`
    }

    return event.reason ?? "Status updated"
  }
  
  return (

    <ul className="relative space-y-6">

      {events.map((event, i) => (

        <li key={event.id} className="relative pl-6">

          {i !== events.length - 1 && (
            <span className="absolute left-0.75 top-3 h-full w-px bg-border" />
          )}

          <span
            className={`absolute left-0 top-2 h-2 w-2 rounded-full ${statusColor[event.toStatus]}`}
          />

          <div className="flex flex-col gap-1">

            <p className="text-sm">
              {getEventMessage(event)}
            </p>

            <p className="text-xs text-muted">
              {new Date(event.createdAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short"
              })}
            </p>

          </div>

        </li>

      ))}

    </ul>
  )
}