import { Router } from "express"
import { requireAuth } from "../middleware/auth.middleware.js"
import { requireRole } from "../middleware/rbac.middleware.js"
import * as incentiveController from "../controllers/incentive.controller.js"

const router = Router()

router.get(
    "/my",
    requireAuth,
    incentiveController.getMyIncentives
)

router.get(
    "/review",
    requireAuth,
    requireRole("TEAM_LEAD", "MANAGER", "OWNER_FINANCE"),
    incentiveController.getReviewQueue
)

router.get(
    "/payments",
    requireAuth,
    requireRole("OWNER_FINANCE"),
    incentiveController.getPaymentQueue
)

router.get(
    "/payments/:id",
    requireAuth,
    requireRole("OWNER_FINANCE"),
    incentiveController.getPaymentDetail
)

router.post(
    "/:id/approve",
    requireAuth,
    requireRole("TEAM_LEAD", "MANAGER", "OWNER_FINANCE"),
    incentiveController.approveIncentive
)

router.post(
    "/:id/hold",
    requireAuth,
    requireRole("TEAM_LEAD", "MANAGER", "OWNER_FINANCE"),
    incentiveController.holdIncentive
)

router.post(
    "/:id/reopen",
    requireAuth,
    requireRole("TEAM_LEAD", "MANAGER", "OWNER_FINANCE"),
    incentiveController.reopenIncentive
)

router.post(
    "/:id/claim",
    requireAuth,
    requireRole("SALES","TEAM_LEAD", "MANAGER", "OWNER_FINANCE"),
    incentiveController.claimIncentive
)

router.post(
    "/:id/pay",
    requireAuth,
    requireRole("OWNER_FINANCE"),
    incentiveController.markPaid
)

router.get(
    "/:id",
    requireAuth,
    incentiveController.getIncentiveDetails
)

export default router