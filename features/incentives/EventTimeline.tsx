import type { IncentiveEvent } from "@/types/api.types"

export default function EventTimeline({ events }: { events: IncentiveEvent[] }) {

  return (

    <div className="border p-4">

      <h2 className="mb-4 font-semibold">
        Timeline
      </h2>

      <ul className="space-y-3">

        {events.map((event) => (

          <li key={event.id}>

            <p>
              {event.actorUser.name} → {event.toStatus}
            </p>

            <p className="text-sm text-gray-500">
              {new Date(event.createdAt).toLocaleString()}
            </p>

          </li>

        ))}

      </ul>

    </div>
  )
}
