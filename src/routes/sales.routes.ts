import { Router } from "express"
import { requireAuth } from "../middleware/auth.middleware.js"
import { requireRole } from "../middleware/rbac.middleware.js"
import * as saleController from "../controllers/sale.controller.js"

const router = Router()

router.post(
    "/",
    requireAuth,
    requireRole("SALES"),
    saleController.createSale
)

export default router