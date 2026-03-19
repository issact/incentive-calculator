import { Router } from "express"
import { requireAuth } from "../middleware/auth.middleware.js"
import { requireRole } from "../middleware/rbac.middleware.js"
import * as adminController from "../controllers/admin.controller.js"

const router = Router()

router.post(
    "/users",
    requireAuth,
    requireRole("ADMIN"),
    adminController.createUser
)

router.patch(
    "/users/:id",
    requireAuth,
    requireRole("ADMIN"),
    adminController.updateUser
)

router.patch(
    "/users/:id/manager",
    requireAuth,
    requireRole("ADMIN"),
    adminController.updateManager
)

router.get(
    "/users",
    requireAuth,
    requireRole("ADMIN"),
    adminController.getUsers
)

router.delete(
    "/users/:id",
    requireAuth,
    requireRole("ADMIN"),
    adminController.deleteUser
)

router.post(
    "/incentive-rules",
    requireAuth,
    requireRole("ADMIN"),
    adminController.createRule
)

router.get(
    "/incentive-rules/active",
    requireAuth,
    requireRole("ADMIN"),
    adminController.getActiveRules
)

router.get(
    "/incentive-rules",
    requireAuth,
    requireRole("ADMIN"),
    adminController.getRules
)



export default router