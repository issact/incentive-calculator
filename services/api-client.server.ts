import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL

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
    const text = await res.text()
    throw new Error(text || "API Error")
  }

  return res.json()
}

