"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  approveIncentive,
  claimIncentive,
  markPaid,
  reopenIncentive
} from "@/services/incentives.api"
import type { IncentiveDetail } from "@/types/api.types"

export default function IncentiveActions({ incentive }: { incentive: IncentiveDetail }) {

  const qc = useQueryClient()

  function invalidateIncentives() {
    qc.invalidateQueries({ queryKey: ["my-incentives"] })
    qc.invalidateQueries({ queryKey: ["review-incentives"] })
    qc.invalidateQueries({ queryKey: ["reports"] })
    qc.invalidateQueries({ queryKey: ["incentive-detail", incentive.id] })
  }

  const approve = useMutation<IncentiveDetail>({
    mutationFn: () => approveIncentive(incentive.id),
    onSuccess: invalidateIncentives
  })

  const claim = useMutation<IncentiveDetail>({
    mutationFn: () => claimIncentive(incentive.id),
    onSuccess: invalidateIncentives
  })

  const reopen = useMutation<IncentiveDetail>({
    mutationFn: () => reopenIncentive(incentive.id),
    onSuccess: invalidateIncentives
  })

  const pay = useMutation<IncentiveDetail>({
    mutationFn: () => markPaid(incentive.id),
    onSuccess: invalidateIncentives
  })

  return (

    <div className="flex gap-3">

      {incentive.status === "PENDING_REVIEW" && (
        <button onClick={() => approve.mutate()}>
          Approve
        </button>
      )}

      {incentive.status === "ON_HOLD" && (
        <button onClick={() => reopen.mutate()}>
          Reopen
        </button>
      )}

      {incentive.status === "CLAIMABLE" && (
        <button onClick={() => claim.mutate()}>
          Claim
        </button>
      )}

      {incentive.claimRequestedAt && incentive.status !== "PAID" && (
        <button onClick={() => pay.mutate()}>
          Mark Paid
        </button>
      )}

    </div>
  )
}
