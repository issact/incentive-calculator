import LogoutButton from "@/features/auth/LogoutButton"
import { getSession } from "@/lib/getSession"

export default async function Topbar() {

    const session = await getSession()

    return (

        <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-6">

            <div className="font-medium text-foreground">
                {session?.user.role.replaceAll("_", " ")}
            </div>

            <LogoutButton />

        </header>

    )
}
