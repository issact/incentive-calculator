"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { NavItem } from "@/lib/navigation"

export default function SidebarNav({ items }: { items: NavItem[] }) {

    const pathname = usePathname()

    return (

        <nav className="space-y-1 border-t border-border/40 p-4">

            {items.map((item) => {

                const active =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/")

                return (

                    <Link
                        key={item.href}
                        href={item.href}
                        className={`block rounded px-3 py-2 text-sm transition
                             ${active
                                ? "bg-surface-muted text-foreground font-medium border-l-4 border-primary pl-2"
                                : "text-surface hover:bg-surface/70 hover:text-foreground"} `}>
                        {item.label}
                    </Link>

                )
            })}

        </nav>
    )
}