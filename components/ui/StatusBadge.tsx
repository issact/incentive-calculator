

type Props = {
  status: string
}

export default function StatusBadge({ status }: Props) {

  const styles: Record<string, string> = {
    PENDING_REVIEW: "bg-warning-soft text-warning",
    ON_HOLD: "bg-danger-soft text-danger",
    CLAIMABLE: "bg-success-soft text-success",
    CLAIM_REQUESTED: "bg-success-soft text-success",
    PAID: "bg-accent-soft text-accent"
  }

  return (
    <span
      className={`px-2 py-1 text-xs rounded-md font-medium ${styles[status] ?? ""}`}
    >
      {status.replace("_", " ")}
    </span>
  )
}