import { cookies } from "next/headers"
import { ApiError } from "./api-error"

const API_URL = process.env.NEXT_PUBLIC_API_URL

async function parseError(res: Response) {
  const contentType = res.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    try {
      const json = await res.json()
      const message =
        (typeof json?.message === "string" && json.message) ||
        (typeof json?.error === "string" && json.error) ||
        (typeof json?.errors === "string" && json.errors) ||
        "API Error"

      const code = typeof json?.code === "string" ? json.code : undefined
      return { message, code, details: json }
    } catch {
      // fallthrough
    }
  }

  const text = await res.text().catch(() => "")
  return { message: text || "API Error" }
}

export async function apiFetchServer<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const cookieStore = await cookies()

  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieStore.toString(),
      ...(options?.headers ?? {}),
    },
    ...options,
  })

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
