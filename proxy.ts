import { NextRequest, NextResponse } from "next/server"
import type { User, UserRole } from "@/types/api.types"
import { ROUTES } from "./lib/rbacRoutes"

const API_URL = process.env.API_URL!

function redirect(req: NextRequest, path: string) {
    return NextResponse.redirect(new URL(path, req.url))
}

const SORTED_ROUTES = [...ROUTES].sort(
    (a, b) => b.path.length - a.path.length
)

function matchRoute(pathname: string) {
    return SORTED_ROUTES.find(route =>
        route.exact
            ? pathname === route.path
            : pathname === route.path || pathname.startsWith(route.path + "/")
    )
}

function isAllowed(pathname: string, role: UserRole) {
    const route = matchRoute(pathname)
    if (!route) {
        console.warn("RBAC: Unmatched route", pathname)
        return false
    }
    return route.roles.includes(role)
}

function getDefaultRoute(role: UserRole) {
    return role === "ADMIN" ? "/admin" : "/dashboard"
}

function isPublic(pathname: string) {
    return (
        pathname.startsWith("/maintenance") ||
        pathname.startsWith("/login")
    )
}

const VALID_ROLES = new Set<UserRole>([
    "SALES",
    "TEAM_LEAD",
    "MANAGER",
    "OWNER_FINANCE",
    "ADMIN"
])

export async function proxy(req: NextRequest) {

    const { pathname } = req.nextUrl

    const cookie = req.headers.get("cookie") ?? ""

    if (isPublic(pathname)) {
        return NextResponse.next()
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)

    let res: Response
    try {
        res = await fetch(`${API_URL}/auth/me`, {
            headers: {
                cookie,
                accept: "application/json",
            },
            cache: "no-store",
            signal: controller.signal,
        })
    } catch {
        return redirect(req, "/maintenance")
    } finally {
        clearTimeout(timeout)
    }

    // Not authenticated
    if (res.status === 401 || res.status === 403) {
        return redirect(req, "/login")
    }

    if (!res.ok) {
        return redirect(req, "/maintenance")
    }

    const user = await res.json() as User
    const role = user?.role

    if (!role || !VALID_ROLES.has(role)) {
        return redirect(req, "/login")
    }

    // Logged in user visiting login page
    if (pathname.startsWith("/login")) {
        return redirect(req, getDefaultRoute(role))
    }

    // Root redirect first
    if (pathname === "/") {
        return redirect(req, getDefaultRoute(role))
    }

    // RBAC check
    if (!isAllowed(pathname, role)) {
        return redirect(req, getDefaultRoute(role))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/",
        "/dashboard/:path*",
        "/sales/:path*",
        "/incentives/:path*",
        "/payments/:path*",
        "/admin/:path*",
        "/reports",
        "/profile",
        "/login",
        "/maintenance"
    ]
}
