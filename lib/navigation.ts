import { UserRole } from "@/types/api.types"

export type NavItem = {
    label: string
    href: string
    roles: UserRole[]
}

export const navigation: NavItem[] = [

    {
        label: "Dashboard",
        href: "/dashboard",
        roles: ["SALES", "TEAM_LEAD", "MANAGER", "OWNER_FINANCE"]
    },

    {
        label: "Create Sale",
        href: "/sales/new",
        roles: ["SALES"]
    },

    {
        label: "My Incentives",
        href: "/incentives/my",
        roles: ["SALES"]
    },

    {
        label: "Review Incentives",
        href: "/incentives/review",
        roles: ["TEAM_LEAD", "MANAGER", "OWNER_FINANCE"]
    },

    {
        label: "Reports",
        href: "/reports/incentives",
        roles: ["SALES", "TEAM_LEAD", "MANAGER", "OWNER_FINANCE"]
    },

    {
        label: "Users",
        href: "/admin/users",
        roles: ["ADMIN"]
    },

    {
        label: "Rules",
        href: "/admin/rules",
        roles: ["ADMIN"]
    },

    {
        label: "Profile",
        href: "/profile",
        roles: ["SALES", "TEAM_LEAD", "MANAGER", "OWNER_FINANCE", "ADMIN"]
    }

]