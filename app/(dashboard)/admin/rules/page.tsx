import RulesTable from "@/features/admin/RulesTable"
import CreateRuleForm from "@/features/admin/CreateRuleForm"

export default function RulesPage() {
    return (
        <div className="space-y-8">

            <header>
                <h1 className="text-2xl font-semibold text-foreground">
                    Incentive Rules
                </h1>
                <p className="text-sm text-muted">
                    Configure commission rates for each incentive level.
                </p>
            </header>

            <section className="rounded-lg border border-border bg-surface p-6">
                <h2 className="mb-4 text-sm font-medium text-muted">
                    Create Rule
                </h2>

                <CreateRuleForm />
            </section>

            <section className="rounded-lg border border-border bg-surface p-6">
                <h2 className="mb-4 text-sm font-medium text-muted">
                    Rules List
                </h2>

                <RulesTable />
            </section>

        </div>
    )
}