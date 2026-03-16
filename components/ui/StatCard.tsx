type Props = {
    title: string
    value: string
}

export default function StatCard({ title, value }: Props) {

    return (
        <div className="rounded-lg border border-border bg-surface p-4">

            <p className="text-xs uppercase tracking-wide text-muted">
                {title}
            </p>

            <p className="mt-1 text-xl font-semibold">
                {value}
            </p>

        </div>
    )
}