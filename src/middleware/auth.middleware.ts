import type { Request, Response, NextFunction } from "express"
import { verifyToken } from "../lib/auth.js"

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.auth_token

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    try {
        const decoded = verifyToken(token)
        req.user = decoded
        next()
    } catch {
        return res.status(401).json({ message: "Invalid token" })
    }
}