import { UserRole } from "@/types/api.types"
import { ROUTES } from "./rbacRoutes"

export type NavItem = {
    label: string
    href: string
}

export function getNavigation(role: UserRole) {
    return ROUTES
        .filter(r => r.nav && r.label && r.roles.includes(role))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(r => ({
            label: r.label!,
            href: r.path
        }))
}