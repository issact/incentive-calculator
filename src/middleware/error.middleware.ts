import type { NextFunction, Request, Response } from "express"
import { HttpError, sendError } from "../utils/errors.js"

export function notFound(req: Request, _res: Response, next: NextFunction) {
    next(HttpError.notFound(`Route ${req.method} ${req.originalUrl} not found`, { code: "ROUTE_NOT_FOUND" }))
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
    // Centralized logging (keep it simple and non-invasive).
    const method = req.method
    const url = req.originalUrl
    const message = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack : undefined
    console.error(`[${method} ${url}]`, message)
    if (stack) console.error(stack)

    return sendError(res, err, { status: 500, message: "Internal server error" })
}
