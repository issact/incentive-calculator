import { ApiError } from "@/services/api-error"

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (!error) return fallback

  if (error instanceof ApiError) {
    return error.message || fallback
  }

  if (error instanceof Error) {
    return error.message || fallback
  }

  if (typeof error === "string") return error || fallback

  try {
    return JSON.stringify(error)
  } catch {
    return fallback
  }
}

