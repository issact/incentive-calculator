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

  const chartData = data.map((i) => ({
    date: i.createdAt.slice(0, 10),
    amount: Number(i.finalAmount)
  }))

  return (

    <div className="h-80 w-full">

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