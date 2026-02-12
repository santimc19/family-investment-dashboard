"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#f59e0b", "#10b981", "#6366f1", "#ef4444", "#8b5cf6"];

export function HistoryChart({
  data,
  personNames,
}: {
  data: Record<string, string | number>[];
  personNames: string[];
}) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <XAxis
          dataKey="date"
          stroke="#52525b"
          tick={{ fill: "#71717a", fontSize: 12 }}
          tickFormatter={(d: string) =>
            new Date(d + "T00:00:00").toLocaleDateString("en-US", {
              month: "short",
              year: "2-digit",
            })
          }
        />
        <YAxis
          stroke="#52525b"
          tick={{ fill: "#71717a", fontSize: 12 }}
          tickFormatter={(v: number) =>
            `$${(v / 1000).toFixed(0)}k`
          }
        />
        <Tooltip
          contentStyle={{
            background: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "8px",
            color: "#fafafa",
          }}
          formatter={(value) =>
            `$${Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
          }
          labelFormatter={(label) =>
            new Date(String(label) + "T00:00:00").toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
          }
        />
        <Legend />
        {personNames.map((name, i) => (
          <Line
            key={name}
            type="monotone"
            dataKey={name}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
