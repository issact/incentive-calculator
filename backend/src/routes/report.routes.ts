import { Router } from "express"
import { requireAuth } from "../middleware/auth.middleware.js"
import * as reportController from "../controllers/report.controller.js"

const router = Router()

router.get(
    "/incentives",
    requireAuth,
    reportController.getIncentiveReport
)

router.get(
    "/dashboard/stats",
    requireAuth,
    reportController.getDashboardStats
)

export default router