import { ApiError } from "./api-error"
import { getPublicApiUrl, getServerApiUrl } from "@/lib/api-base-url"

const API_URL =
  typeof window === "undefined" ? getServerApiUrl() : getPublicApiUrl()

async function parseError(res: Response) {
  const contentType = res.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    try {
      // Common patterns: { message }, { error }, { errors }, { code }
      const json = await res.json()
      const message =
        (typeof json?.message === "string" && json.message) ||
        (typeof json?.error === "string" && json.error) ||
        (typeof json?.errors === "string" && json.errors) ||
        "API Error"

      const code = typeof json?.code === "string" ? json.code : undefined
      return { message, code, details: json }
    } catch {
      // fallthrough to text
    }
  }

  const text = await res.text().catch(() => "")
  return { message: text || "API Error" }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {

  if (!API_URL) {
    throw new ApiError({ message: "Missing API URL configuration", status: 500, code: "CONFIG_ERROR" })
  }

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
      ...options,
    })
  } catch (err) {
    throw new ApiError({
      message: "Backend unavailable",
      status: 503,
      code: "BACKEND_UNAVAILABLE",
      details: { cause: err instanceof Error ? err.message : String(err) },
    })
  }

  if (!res.ok) {
    const parsed = await parseError(res)
    throw new ApiError({
      message: parsed.message,
      status: res.status,
      code: parsed.code,
      details: parsed.details,
    })
  }

  const contentType = res.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    return (await res.text()) as unknown as T
  }

  return res.json() as Promise<T>
}
