import type { ReactNode } from "react"

export interface ChartColumn<Row> {
  key: string
  label: string
  value: (row: Row) => ReactNode
}

interface ChartDataTableProps<Row> {
  caption: string
  summary: string
  columns: ChartColumn<Row>[]
  rows: Row[]
}

export function ChartDataTable<Row>({ caption, summary, columns, rows }: ChartDataTableProps<Row>) {
  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs text-muted-foreground">{summary}</p>
      <details className="rounded-lg border">
        <summary className="min-h-11 cursor-pointer px-3 py-2 text-sm font-medium">View data table</summary>
        <div className="max-h-64 overflow-auto border-t">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">{caption}</caption>
            <thead className="bg-muted/50">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} scope="col" className="px-3 py-2 font-medium">{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-t">
                  {columns.map((column) => (
                    <td key={column.key} className="px-3 py-2">{column.value(row)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
