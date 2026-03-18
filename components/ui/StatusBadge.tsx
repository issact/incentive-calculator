

type Props = {
  status: string
  subtitle?: string
  title?: string
}

export default function StatusBadge({ status, subtitle, title }: Props) {

  const styles: Record<string, string> = {
    PENDING_REVIEW: "bg-warning-soft text-warning",
    ON_HOLD: "bg-danger-soft text-danger",
    CLAIMABLE: "bg-success-soft text-success",
    CLAIM_REQUESTED: "bg-success-soft text-success",
    PAID: "bg-accent-soft text-accent"
  }

  return (
    <div className="inline-flex flex-col" title={title}>
      {subtitle && (
        <span className="text-[10px] text-muted mb-1">
          {subtitle}
        </span>
      )}
      <span
        className={`px-2 py-1 text-xs rounded-md font-medium ${styles[status] ?? ""}`}
      >
        {status.replace("_", " ")}
      </span>

    </div>
  )
}