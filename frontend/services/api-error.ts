export class ApiError extends Error {
  status: number
  code?: string
  details?: unknown

  constructor(args: { message: string; status: number; code?: string; details?: unknown }) {
    super(args.message)
    this.name = "ApiError"
    this.status = args.status
    this.code = args.code
    this.details = args.details
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

