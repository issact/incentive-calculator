import { ApiError } from "@/services/api-error"

type BackendErrorShape = {
  message?: unknown
  code?: unknown
  issues?: unknown
}

export function getApiErrorCode(error: unknown) {
  if (!(error instanceof ApiError)) return undefined
  return error.code
}

export function getApiErrorIssues(error: unknown) {
  if (!(error instanceof ApiError)) return undefined
  const details = error.details as BackendErrorShape | undefined
  if (!details || typeof details !== "object") return undefined
  return Array.isArray(details.issues) ? details.issues : undefined
}

