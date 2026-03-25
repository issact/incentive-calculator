// lib/rbacRoutes.ts
import { UserRole } from "@/types/api.types"

type AppRoute = {
    path: string
    roles: UserRole[]
    label?: string
    nav?: boolean
    exact?: boolean
    order?: number
}

export const ROUTES: AppRoute[] = [
    {
        path: "/dashboard",
        roles: ["SALES", "TEAM_LEAD", "MANAGER", "OWNER_FINANCE"],
        label: "Dashboard",
        nav: true,
        order: 1
    },

    {
        path: "/sales",
        roles: ["SALES", "TEAM_LEAD", "MANAGER", "OWNER_FINANCE"],
        label: "Sales",
        nav: true,
        order: 3
    },
    {
        path: "/sales/new",
        roles: ["SALES"],
        label: "Create Sale",
        nav: true,
        exact: true,
        order: 2
    },

    {
        path: "/incentives",
        roles: ["SALES", "TEAM_LEAD", "MANAGER", "OWNER_FINANCE"]
    },

    {
        path: "/incentives/my",
        roles: ["SALES", "TEAM_LEAD", "MANAGER", "OWNER_FINANCE"],
        label: "My Incentives",
        nav: true,
        order: 4
    },
    {
        path: "/incentives/review",
        roles: ["TEAM_LEAD", "MANAGER", "OWNER_FINANCE"],
        label: "Review Incentives",
        nav: true,
        exact: true,
        order: 5
    },

    {
        path: "/reports",
        roles: ["SALES", "TEAM_LEAD", "MANAGER", "OWNER_FINANCE"],
        label: "Reports",
        nav: true,
        order: 6
    },

    {
        path: "/payments",
        roles: ["OWNER_FINANCE"],
        label: "Payments",
        nav: true,
        order: 7
    },

    {
        path: "/admin",
        roles: ["ADMIN"],
        exact: true
    },
    {
        path: "/admin/users",
        roles: ["ADMIN"],
        label: "Users",
        nav: true,
        order: 8
    },
    {
        path: "/admin/rules",
        roles: ["ADMIN"],
        label: "Rules",
        nav: true,
        order: 9
    },

    {
        path: "/profile",
        roles: ["SALES", "TEAM_LEAD", "MANAGER", "OWNER_FINANCE", "ADMIN"],
        label: "Profile",
        nav: true,
        order: 10
    }
]