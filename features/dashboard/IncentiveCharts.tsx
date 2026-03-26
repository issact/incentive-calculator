"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts"
import type { Incentive } from "@/types/api.types"

export default function IncentiveCharts({ data }: { data: Incentive[] }) {

  const grouped = data.reduce((acc, i) => {
    const date = i.createdAt.slice(0, 10)
    acc[date] = (acc[date] || 0) + Number(i.finalAmount)
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(grouped)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date))

  if (!chartData.length) {
    return <div className="h-80 flex items-center justify-center text-sm text-muted">
      No data available
    </div>
  }

  return (

    <div className="w-full h-75 min-h-75">

      <ResponsiveContainer width="100%" height="100%">

        <LineChart data={chartData}>

          <CartesianGrid
            stroke="var(--border)"
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="date"
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />

          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />

          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "6px"
            }}
            labelStyle={{ color: "var(--fg)" }}
          />

          <Line
            type="monotone"
            dataKey="amount"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={false}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>

  )
}