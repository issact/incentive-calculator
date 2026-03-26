import UsersTable from "@/features/admin/UsersTable"
import CreateUserForm from "@/features/admin/CreateUserForm"

export default function UsersPage() {

    return (

        <div className="space-y-6 max-w-7xl mx-auto p-2">

            <header>
                <h1 className="text-2xl font-semibold text-foreground">
                    Users
                </h1>
                <p className="text-sm text-muted">
                    Create and manage system users and roles.
                </p>
            </header>

            <section className="rounded-lg border border-border bg-surface p-6">
                <h2 className="mb-4 text-sm font-medium text-muted">
                    Create User
                </h2>

                <CreateUserForm />
            </section>

            <section className="rounded-lg border border-border bg-surface p-6">
                <h2 className="mb-4 text-sm font-medium text-muted">
                    User List
                </h2>

                <UsersTable />
            </section>

        </div>

    )
}