import Link from "next/link"
import { navigation } from "@/lib/navigation"
import { getSession } from "@/lib/getSession"

export default async function Sidebar() {

    const session = await getSession()

    const role = session?.user.role

    const items = role ? navigation.filter((item) => item.roles.includes(role)) : []

    return (

        <aside className="w-64 border-r border-border bg-foreground text-background">

            <h2 className="text-lg font-semibold p-4">
                Incentive System
            </h2>

            <nav className="space-y-2 border-t border-border/40 p-4">

                {items.map(item => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="block rounded-md px-3 py-2 text-sm text-surface hover:bg-surface-muted hover:text-foreground transition"
                    >
                        {item.label}
                    </Link>
                ))}

            </nav>

        </aside>

    )
}
