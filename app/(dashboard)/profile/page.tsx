import { getSession } from "@/lib/getSession"

export default async function ProfilePage() {

    const session = await getSession()
    const user = session?.user

    if (!user) {
        return (
            <div className="text-sm text-muted">
                Unable to load profile.
            </div>
        )
    }

    return (

        <div className="space-y-8">

            <header>
                <h1 className="text-2xl font-semibold text-foreground">
                    Profile
                </h1>

                <p className="text-sm text-muted">
                    Your account information and role details.
                </p>
            </header>

            <section className="rounded-lg border border-border bg-surface p-6">

                <h2 className="mb-6 text-sm font-medium text-muted">
                    Account Information
                </h2>

                <div className="grid gap-6 md:grid-cols-2">

                    <ProfileField label="Name" value={user.name} />

                    <ProfileField label="Email" value={user.email} />

                    <ProfileField label="Role" value={user.role} />

                    <ProfileField
                        label="Status"
                        value={
                            <span
                                className={
                                    user.isActive
                                        ? "rounded bg-success-soft px-2 py-1 text-xs text-success"
                                        : "rounded bg-danger-soft px-2 py-1 text-xs text-danger"
                                }
                            >
                                {user.isActive ? "Active" : "Disabled"}
                            </span>
                        }
                    />

                    <ProfileField
                        label="Manager"
                        value={user.manager?.name ?? "—"}
                    />

                    <ProfileField
                        label="Account Created"
                        value={new Date(user.createdAt).toLocaleDateString()}
                    />

                </div>

            </section>

        </div>

    )
}


function ProfileField({
    label,
    value,
}: {
    label: string
    value: React.ReactNode
}) {

    return (
        <div className="space-y-1">
            <div className="text-xs font-medium uppercase tracking-wide text-muted">
                {label}
            </div>

            <div className="text-sm text-foreground">
                {value}
            </div>
        </div>
    )
}