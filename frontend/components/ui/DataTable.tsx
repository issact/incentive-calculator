import type { ReactNode } from "react"

export type DataTableColumn<Row> = {
  header: ReactNode
  cell: (row: Row) => ReactNode
}

export type DataTableProps<Row> = {
  rows: Row[]
  columns: DataTableColumn<Row>[]
  getRowKey: (row: Row) => string
  className?: string
}

export default function DataTable<Row>({
  rows,
  columns,
  getRowKey,
  className,
}: DataTableProps<Row>) {

  return (

    <div className="overflow-hidden rounded-lg border border-border bg-surface">

      <table className={className ?? "w-full"}>

        <thead className="bg-surface-muted">
          <tr>
            {columns.map((c, idx) => (
              <th
                key={idx}
                className="border-b border-border px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted"
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr
              key={getRowKey(row)}
              className="border-b border-border last:border-0 hover:bg-surface-muted"
            >
              {columns.map((c, idx) => (
                <td
                  key={idx}
                  className="px-4 py-3 text-sm text-foreground"
                >
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>

      </table>

    </div>

  )
}