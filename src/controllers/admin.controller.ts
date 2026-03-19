import type { Request, Response } from "express"
import * as userService from "../services/user.service.js"
import * as ruleService from "../services/rule.service.js"

export async function createUser(req: Request, res: Response) {
    try {
        const user = await userService.createUser(req.body)
        res.json(user)
    } catch (err: any) {
        res.status(400).json({ message: err.message })
    }
}

export async function updateUser(req: Request<{ id: string }>, res: Response) {
    try {
        const user = await userService.updateUser(req.params.id, req.body)
        res.json(user)
    } catch {
        res.status(500).json({ message: "Failed to update user" })
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
        res.status(500).json({ message: "Failed to update manager" })
    }
}

export async function getUsers(req: Request, res: Response) {
    try {
        const rules = await userService.getUsers()
        res.json(rules)
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch users" })
    }
}

export async function deleteUser(req: Request<{ id: string }>, res: Response) {
    try {
        await userService.deleteUser(req.params.id)
        res.json({ success: true })
    } catch {
        res.status(500).json({ message: "Failed to delete user" })
    }
}

export async function createRule(req: Request, res: Response) {
    try {
        const rule = await ruleService.createRule(req.body)
        res.json(rule)
    } catch (err: any) {
        res.status(400).json({ message: err.message })
    }
}

export async function getRules(req: Request, res: Response) {
    try {
        const rules = await ruleService.getRules()
        res.json(rules)
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch rules" })
    }
}

export async function getActiveRules(req: Request, res: Response) {
    try {
        const rules = await ruleService.getActiveRules()
        res.json(rules)
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch active rules" })
    }
}