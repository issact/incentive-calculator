import { NextRequest, NextResponse } from "next/server"
import { getBackendApiUrl } from "@/lib/api-base-url"

const AUTH_COOKIE = "auth_token"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7

type RouteContext = {
  params: Promise<{ path: string[] }>
}

function buildBackendUrl(pathSegments: string[], search: string): string {
  const path = pathSegments.join("/")
  const base = getBackendApiUrl()
  return `${base}/${path}${search}`
}

function forwardRequestHeaders(req: NextRequest): Headers {
  const headers = new Headers()
  const contentType = req.headers.get("content-type")
  const accept = req.headers.get("accept")

  if (contentType) headers.set("content-type", contentType)
  if (accept) headers.set("accept", accept)

  const token = req.cookies.get(AUTH_COOKIE)?.value
  if (token) {
    headers.set("cookie", `${AUTH_COOKIE}=${token}`)
  }

  return headers
}

function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  })
}

function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}

async function proxy(req: NextRequest, context: RouteContext) {
  const { path } = await context.params
  const pathKey = path.join("/")
  const backendUrl = buildBackendUrl(path, req.nextUrl.search)
  const method = req.method.toUpperCase()
  const hasBody = method !== "GET" && method !== "HEAD"

  const backendRes = await fetch(backendUrl, {
    method,
    headers: forwardRequestHeaders(req),
    body: hasBody ? await req.text() : undefined,
    cache: "no-store",
  })

  const contentType = backendRes.headers.get("content-type") ?? ""
  const isJson = contentType.includes("application/json")

  if (pathKey === "auth/login" && backendRes.ok && isJson) {
    const data = (await backendRes.json()) as {
      message?: string
      token?: string
    }
    const response = NextResponse.json({ message: data.message ?? "Login successful" })
    if (data.token) {
      setAuthCookie(response, data.token)
    }
    return response
  }

  if (pathKey === "auth/logout" && backendRes.ok) {
    const body = isJson ? await backendRes.json() : await backendRes.text()
    const response = isJson
      ? NextResponse.json(body)
      : new NextResponse(body, { status: backendRes.status })
    clearAuthCookie(response)
    return response
  }

  const body = await backendRes.arrayBuffer()
  const response = new NextResponse(body, { status: backendRes.status })
  if (contentType) {
    response.headers.set("content-type", contentType)
  }
  return response
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
