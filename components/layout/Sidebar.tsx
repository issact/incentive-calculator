import { navigation } from "@/lib/navigation"
import { getSession } from "@/lib/getSession"
import SidebarNav from "./SidebarNav"


export default async function Sidebar() {

    const session = await getSession()
    const role = session?.user.role

    const items = role
        ? navigation.filter((item) => item.roles.includes(role))
        : []

    return (
        <aside className="w-64 border-r border-border bg-foreground text-background">

            <div className="p-4 text-lg font-semibold">
                Incentive System
            </div>

            <SidebarNav items={items} />

        </aside>
    )
}