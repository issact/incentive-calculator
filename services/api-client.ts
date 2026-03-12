const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {

  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  })

  if (!res.ok) {

    const text = await res.text()
    throw new Error(text || "API Error")
  }

  return res.json()
}