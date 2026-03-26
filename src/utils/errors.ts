import type { Response } from "express"
import { ZodError } from "zod"
import { Prisma } from "../generated/prisma/client"

export type ErrorResponseBody = {
    message: string
    code?: string
    issues?: unknown
}

export class HttpError extends Error {
    status: number
    code: string | undefined
    issues: unknown | undefined

    constructor(status: number, message: string, opts?: { code?: string; issues?: unknown; cause?: unknown }) {
        super(message)
        this.name = "HttpError"
        this.status = status
        this.code = opts?.code
        this.issues = opts?.issues

        // Node 16+ supports cause in Error options, but keep it runtime-safe.
        if (opts?.cause !== undefined) {
            this.cause = opts.cause
        }
    }

    static badRequest(message: string, opts?: { code?: string; issues?: unknown; cause?: unknown }) {
        return new HttpError(400, message, opts)
    }

    static unauthorized(message = "Unauthorized", opts?: { code?: string; issues?: unknown; cause?: unknown }) {
        return new HttpError(401, message, opts)
    }

    static forbidden(message = "Forbidden", opts?: { code?: string; issues?: unknown; cause?: unknown }) {
        return new HttpError(403, message, opts)
    }

    static notFound(message = "Not found", opts?: { code?: string; issues?: unknown; cause?: unknown }) {
        return new HttpError(404, message, opts)
    }

    static conflict(message = "Conflict", opts?: { code?: string; issues?: unknown; cause?: unknown }) {
        return new HttpError(409, message, opts)
    }
}

function looksLikeBadRequestMessage(message: string) {
    return message.startsWith("Invalid") || message.includes("fromDate must be")
}

function looksLikeConflictMessage(message: string) {
    return message.toLowerCase().includes("already exists")
}

function looksLikeDatabaseUnavailable(message: string) {
    const msg = message.toLowerCase()
    return (
        msg.includes("unable to start a transaction") ||
        msg.includes("can't reach database server") ||
        msg.includes("connection") && msg.includes("timeout") ||
        msg.includes("econnrefused") ||
        msg.includes("enotfound")
    )
}

export function toHttpError(err: unknown, fallback: { status: number; message: string }): HttpError {
    if (err instanceof HttpError) return err

    if (err instanceof ZodError) {
        return HttpError.badRequest("Validation error", {
            code: "VALIDATION_ERROR",
            issues: err.issues,
            cause: err
        })
    }

    // Express JSON parser errors
    if (err instanceof SyntaxError && "message" in err && (err as any).type === "entity.parse.failed") {
        return HttpError.badRequest("Invalid JSON", { code: "INVALID_JSON", cause: err })
    }

    // Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            return HttpError.conflict("Unique constraint failed", {
                code: "PRISMA_P2002",
                issues: err.meta ?? undefined,
                cause: err
            })
        }
        if (err.code === "P2025") {
            return HttpError.notFound("Record not found", { code: "PRISMA_P2025", cause: err })
        }
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
        return HttpError.badRequest("Invalid request", { code: "PRISMA_VALIDATION_ERROR", cause: err })
    }

    // Prisma connectivity / engine errors (common when DB is down)
    if (
        err instanceof Prisma.PrismaClientInitializationError ||
        err instanceof Prisma.PrismaClientUnknownRequestError
    ) {
        return new HttpError(503, "Database unavailable", {
            code: "DATABASE_UNAVAILABLE",
            cause: err
        })
    }

    if (err instanceof Error) {
        if (looksLikeBadRequestMessage(err.message)) {
            return HttpError.badRequest(err.message, { code: "BAD_REQUEST", cause: err })
        }
        if (looksLikeConflictMessage(err.message)) {
            return HttpError.conflict(err.message, { code: "CONFLICT", cause: err })
        }
        if (looksLikeDatabaseUnavailable(err.message)) {
            return new HttpError(503, "Database unavailable", { code: "DATABASE_UNAVAILABLE", cause: err })
        }
        return new HttpError(fallback.status, err.message || fallback.message, { cause: err })
    }

    return new HttpError(fallback.status, fallback.message)
}

export function sendError(
    res: Response,
    err: unknown,
    fallback: { status: number; message: string } = { status: 500, message: "Internal server error" },
    opts?: { forceFallbackMessageOn5xx?: boolean }
) {
    const httpError = toHttpError(err, fallback)

    const body: ErrorResponseBody = {
        message:
            opts?.forceFallbackMessageOn5xx && httpError.status >= 500
                ? fallback.message
                : (httpError.message || fallback.message)
    }

    if (httpError.code) body.code = httpError.code
    if (httpError.issues) body.issues = httpError.issues

    return res.status(httpError.status).json(body)
}
