import { Router } from "express"
import { requireAuth } from "../middleware/auth.middleware.js"
import { requireRole } from "../middleware/rbac.middleware.js"
import * as saleController from "../controllers/sale.controller.js"

const router = Router()

router.get(
    "/",
    requireAuth,
    saleController.listSales
)

router.get(
    "/:id",
    requireAuth,
    saleController.getSaleById
)

router.post(
    "/:id/void",
    requireAuth,
    requireRole("OWNER_FINANCE"),
    saleController.voidSale
)

router.post(
    "/",
    requireAuth,
    requireRole("SALES"),
    saleController.createSale
)

export default router
