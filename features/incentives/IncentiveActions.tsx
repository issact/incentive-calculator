"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  approveIncentive,
  claimIncentive,
  holdIncentive,
  markPaid,
  reopenIncentive
} from "@/services/incentives.api"
import type { IncentiveDetail, User } from "@/types/api.types"
import { useState } from "react"
import HoldModal from "./HoldModal"

export default function IncentiveActions({
  incentive,
  user
}: {
  incentive: IncentiveDetail
  user: User | undefined
}) {
  const [holdOpen, setHoldOpen] = useState(false)

  const qc = useQueryClient()

  const isBeneficiary = user?.id === incentive.beneficiaryUserId
  const isReviewer = user?.id === incentive.reviewerUserId
  const isFinance = user?.role === "OWNER_FINANCE"

  function invalidateIncentives() {
    qc.invalidateQueries({ queryKey: ["my-incentives"] })
    qc.invalidateQueries({ queryKey: ["review-incentives"] })
    qc.invalidateQueries({ queryKey: ["reports"] })
    qc.invalidateQueries({ queryKey: ["incentive-detail", incentive.id] })
  }

  const approve = useMutation({
    mutationFn: () => approveIncentive(incentive.id),
    onSuccess: invalidateIncentives
  })

  const hold = useMutation({
    mutationFn: (reason: string) => holdIncentive(incentive.id, reason),
    onSuccess: invalidateIncentives
  })

  const claim = useMutation({
    mutationFn: () => claimIncentive(incentive.id),
    onSuccess: invalidateIncentives
  })

  const reopen = useMutation({
    mutationFn: () => reopenIncentive(incentive.id),
    onSuccess: invalidateIncentives
  })

  const pay = useMutation({
    mutationFn: () => markPaid(incentive.id),
    onSuccess: invalidateIncentives
  })

  const canApprove =
    isReviewer && incentive.status === "PENDING_REVIEW"

  const canHold =
    isReviewer && incentive.status === "PENDING_REVIEW"

  const canReopen =
    isReviewer && incentive.status === "ON_HOLD"

  const canClaim =
    isBeneficiary && incentive.status === "CLAIMABLE"

  const canPay =
    isFinance &&
    incentive.claimRequestedAt &&
    incentive.status !== "PAID"

  const hasActions =
    canApprove || canHold || canReopen || canClaim || canPay

  if (!hasActions) {

    let message = "No actions available."

    if (incentive.status === "PAID") {
      message = "This incentive has already been paid."
    } else if (incentive.status === "PENDING_REVIEW") {
      message = "Waiting for the assigned reviewer to approve."
    } else if (incentive.status === "CLAIMABLE") {
      message = "Waiting for the beneficiary to claim the incentive."
    }

    return (
      <div className="text-sm text-muted">
        {message}
      </div>
    )
  }

  return (

    <div className="flex flex-wrap gap-3 mt-2">

      {canApprove && (
        <button
          className="bg-success text-white border-success hover:opacity-90 cursor-pointer"
          disabled={approve.isPending}
          onClick={() => approve.mutate()}
        >
          {approve.isPending ? "Approving..." : "Approve"}
        </button>
      )}

      {canHold && (
        <button
          className="bg-warning text-white border-warning hover:opacity-90 cursor-pointer"
          disabled={hold.isPending}
          onClick={() => setHoldOpen(true)}
        >
          {hold.isPending ? "Holding..." : "Put On Hold"}
        </button>
      )}

      {canReopen && (
        <button
          className="bg-warning text-white border-warning hover:opacity-90 cursor-pointer"
          disabled={reopen.isPending}
          onClick={() => reopen.mutate()}
        >
          {reopen.isPending ? "Reopening..." : "Reopen"}
        </button>
      )}

      {canClaim && (
        <button
          className="bg-primary text-white border-primary hover:bg-primary-hover cursor-pointer"
          disabled={claim.isPending}
          onClick={() => claim.mutate()}
        >
          {claim.isPending ? "Claiming..." : "Claim Incentive"}
        </button>
      )}

      {canPay && (
        <button
          className="bg-accent text-white border-accent hover:opacity-90 cursor-pointer"
          disabled={pay.isPending}
          onClick={() => pay.mutate()}
        >
          {pay.isPending ? "Processing..." : "Mark Paid"}
        </button>
      )}


      <HoldModal
        open={holdOpen}
        loading={hold.isPending}
        onClose={() => setHoldOpen(false)}
        onSubmit={(reason) => {
          hold.mutate(reason)
          setHoldOpen(false)
        }}
      />
    </div>
  )
}