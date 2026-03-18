import { NextRequest, NextResponse } from "next/server"
import type { User } from "@/types/api.types"

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export async function proxy(req: NextRequest) {

    const { pathname } = req.nextUrl

    const cookie = req.headers.get("cookie") ?? ""

    const res = await fetch(`${API_URL}/auth/me`, {
        headers: { cookie },
        cache: "no-store",
    })

    // Not authenticated
    if (res.status === 401 || res.status === 403) {

        if (pathname.startsWith("/login")) {
            return NextResponse.next()
        }

        return NextResponse.redirect(new URL("/login", req.url))
    }

    const user = await res.json() as User
    const role = user?.role

    if (!role) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    // Logged in user visiting login page
    if (pathname.startsWith("/login")) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    if (!isAllowed(pathname, role)) {
        if (role === "ADMIN") {
            return NextResponse.redirect(new URL("/admin", req.url))
        }

        return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
}

function isAllowed(pathname: string, role: string) {

    const map: Record<string, string[]> = {

        SALES: [
            "/dashboard",
            "/sales/new",
            "/incentives",
            "/incentives/my",
            "/reports/incentives",
            "/profile"
        ],

        TEAM_LEAD: [
            "/dashboard",
            "/incentives",
            "/incentives/my",
            "/incentives/review",
            "/reports/incentives",
            "/profile"
        ],

        MANAGER: [
            "/dashboard",
            "/incentives",
            "/incentives/my",
            "/incentives/review",
            "/reports/incentives",
            "/profile"
        ],

        OWNER_FINANCE: [
            "/dashboard",
            "/incentives",
            "/incentives/my",
            "/incentives/review",
            "/reports/incentives",
            "/profile",
            "/payments"
        ],

        ADMIN: [
            "/admin",
            "/admin/users",
            "/admin/rules",
            "/profile"
        ]
    }

    const allowed = map[role] ?? []

    return allowed.some(route =>
        pathname === route || pathname.startsWith(route + "/")
    )
}

export const config = {
    matcher: [
        "/",
        "/dashboard/:path*",
        "/sales/:path*",
        "/incentives/:path*",
        "/reports/:path*",
        "/payments/:path*",
        "/admin/:path*",
        "/profile",
        "/login"
    ]
}