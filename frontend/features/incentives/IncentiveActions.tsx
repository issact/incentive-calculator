"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  approveIncentive,
  claimIncentive,
  holdIncentive,
  reopenIncentive
} from "@/services/incentives.api"
import type { ClaimPayload, IncentiveDetail, User } from "@/types/api.types"
import { useState } from "react"
import HoldModal from "./HoldModal"
import ApproveModal from "./ApproveModal"
import { useRouter } from "next/navigation"
import ClaimModal from "./ClaimModal"
import { useToast } from "@/providers/ToastProvider"
import { getErrorMessage } from "@/lib/getErrorMessage"

export default function IncentiveActions({
  incentive,
  user
}: {
  incentive: IncentiveDetail
  user: User | undefined
}) {
  const [approveOpen, setApproveOpen] = useState(false)
  const [holdOpen, setHoldOpen] = useState(false)
  const [claimOpen, setClaimOpen] = useState(false)

  const qc = useQueryClient()
  const router = useRouter()
  const { toast } = useToast()

  const status = incentive.effectiveStatus ?? incentive.status
  const isBeneficiary = user?.id === incentive.beneficiaryUserId
  const isReviewer = user?.id === incentive.reviewerUserId

  function invalidateIncentives() {
    qc.invalidateQueries({ queryKey: ["my-incentives"], exact: false })
    qc.invalidateQueries({ queryKey: ["review-incentives"], exact: false })
    qc.invalidateQueries({ queryKey: ["reports"] })
    qc.invalidateQueries({ queryKey: ["incentive-detail", incentive.id] })
  }

  const approve = useMutation({
    mutationFn: (data: {
      performanceScores: Record<string, number>
      manualOverrideAmount?: number
      reason?: string
    }) => approveIncentive(incentive.id, data),
    onSuccess: () => {
      invalidateIncentives()
      router.refresh()
    },
    onError: (err) => {
      toast({
        title: "Approval failed",
        description: getErrorMessage(err),
        variant: "error",
      })
    },
  })

  const hold = useMutation({
    mutationFn: (reason: string) => holdIncentive(incentive.id, reason),
    onSuccess: () => {
      invalidateIncentives()
      router.refresh()
    },
    onError: (err) => {
      toast({
        title: "Hold failed",
        description: getErrorMessage(err),
        variant: "error",
      })
    },
  })

  const claim = useMutation({
    mutationFn: (data: ClaimPayload) => claimIncentive(incentive.id, data),
    onSuccess: () => {
      invalidateIncentives()
      router.refresh()
    },
    onError: (err) => {
      toast({
        title: "Claim failed",
        description: getErrorMessage(err),
        variant: "error",
      })
    },
  })

  const reopen = useMutation({
    mutationFn: () => reopenIncentive(incentive.id),
    onSuccess: () => {
      invalidateIncentives()
      router.refresh()
      toast({ title: "Incentive reopened", variant: "success" })
    },
    onError: (err) => {
      toast({
        title: "Reopen failed",
        description: getErrorMessage(err),
        variant: "error",
      })
    },
  })

  const canApprove =
    isReviewer && status === "PENDING_REVIEW"

  const canHold =
    isReviewer && status === "PENDING_REVIEW"

  const canReopen = isReviewer && status === "ON_HOLD" && user?.id === incentive.heldById

  const canClaim =
    isBeneficiary && status === "CLAIMABLE"

  const hasActions =
    canApprove || canHold || canReopen || canClaim

  if (!hasActions) {

    let message = "No actions available."

    if (status === "PAID") {
      message = "This incentive has already been paid."
    } else if (status === "PENDING_REVIEW") {
      message = "Waiting for the assigned reviewer to approve."
    } else if (status === "CLAIMABLE") {
      message = "Waiting for the beneficiary to claim the incentive."
    } else if (status === "CLAIM_REQUESTED") {
      message = "Waiting for finance to complete payment."
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
          onClick={() => setApproveOpen(true)}
        >
          Approve
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
          onClick={() => setClaimOpen(true)}
        >
          Claim Incentive
        </button>
      )}

      <ApproveModal
        open={approveOpen}
        loading={approve.isPending}
        onClose={() => setApproveOpen(false)}
        onSubmit={(data) => {
          approve.mutate(data, {
            onSuccess: () => {
              toast({ title: "Incentive approved", variant: "success" })
              setApproveOpen(false)
            }
          })
        }}
        baseAmount={Number(incentive.baseAmount)}
      />

      <HoldModal
        open={holdOpen}
        loading={hold.isPending}
        onClose={() => setHoldOpen(false)}
        onSubmit={(reason) => {
          hold.mutate(reason, {
            onSuccess: () => {
              toast({ title: "Incentive put on hold", variant: "success" })
              setHoldOpen(false)
            }
          })
        }}
      />

      <ClaimModal
        open={claimOpen}
        loading={claim.isPending}
        onClose={() => setClaimOpen(false)}
        onSubmit={(data) => {
          claim.mutate(data, {
            onSuccess: () => {
              toast({ title: "Claim submitted", variant: "success" })
              setClaimOpen(false)
            }
          })
        }}
      />
    </div>
  )
}
