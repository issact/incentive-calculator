import type { Request, Response } from "express"
import * as userService from "../services/user.service.js"
import * as ruleService from "../services/rule.service.js"
import { sendError } from "../utils/errors.js"

export async function createUser(req: Request, res: Response) {
    try {
        const user = await userService.createUser(req.body)
        res.json(user)
    } catch (err: any) {
        return sendError(res, err, { status: 400, message: "Failed to create user" })
    }
}

export async function updateUser(req: Request<{ id: string }>, res: Response) {
    try {
        const user = await userService.updateUser(req.params.id, req.body)
        res.json(user)
    } catch (err) {
        return sendError(
            res,
            err,
            { status: 500, message: "Failed to update user" },
            { forceFallbackMessageOn5xx: true }
        )
    }
}

export async function updateManager(
    req: Request<{ id: string }>,
    res: Response
) {
    try {
        const { id } = req.params
        const { managerId } = req.body

        if (!managerId) {
            return res.status(400).json({ message: "managerId is required" })
        }

        const user = await userService.updateManager(id, managerId)

        res.json(user)
    } catch (err) {
        return sendError(
            res,
            err,
            { status: 500, message: "Failed to update manager" },
            { forceFallbackMessageOn5xx: true }
        )
    }
}

export async function getUsers(req: Request, res: Response) {
    try {
        const rules = await userService.getUsers()
        res.json(rules)
    } catch (err) {
        return sendError(
            res,
            err,
            { status: 500, message: "Failed to fetch users" },
            { forceFallbackMessageOn5xx: true }
        )
    }
}

export async function deleteUser(req: Request<{ id: string }>, res: Response) {
    try {
        await userService.deleteUser(req.params.id)
        res.json({ success: true })
    } catch (err) {
        return sendError(
            res,
            err,
            { status: 500, message: "Failed to delete user" },
            { forceFallbackMessageOn5xx: true }
        )
    }
}

export async function createRule(req: Request, res: Response) {
    try {
        const rule = await ruleService.createRule(req.body)
        res.json(rule)
    } catch (err: any) {
        return sendError(res, err, { status: 400, message: "Failed to create rule" })
    }
}

export async function getRules(req: Request, res: Response) {
    try {
        const rules = await ruleService.getRules()
        res.json(rules)
    } catch (err) {
        return sendError(
            res,
            err,
            { status: 500, message: "Failed to fetch rules" },
            { forceFallbackMessageOn5xx: true }
        )
    }
}

export async function getActiveRules(req: Request, res: Response) {
    try {
        const rules = await ruleService.getActiveRules()
        res.json(rules)
    } catch (err) {
        return sendError(
            res,
            err,
            { status: 500, message: "Failed to fetch active rules" },
            { forceFallbackMessageOn5xx: true }
        )
    }
}
