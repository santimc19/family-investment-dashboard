"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  { stroke: "#f59e0b", fill: "#f59e0b" },
  { stroke: "#10b981", fill: "#10b981" },
  { stroke: "#6366f1", fill: "#6366f1" },
  { stroke: "#f43f5e", fill: "#f43f5e" },
  { stroke: "#8b5cf6", fill: "#8b5cf6" },
];

export function HistoryChart({
  data,
  personNames,
}: {
  data: Record<string, string | number>[];
  personNames: string[];
}) {
  return (
    <ResponsiveContainer width="100%" height={420}>
      <AreaChart data={data}>
        <defs>
          {personNames.map((_, i) => (
            <linearGradient key={i} id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS[i % COLORS.length].fill} stopOpacity={0.15} />
              <stop offset="100%" stopColor={COLORS[i % COLORS.length].fill} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <XAxis
          dataKey="date"
          stroke="#27272a"
          tick={{ fill: "#52525b", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(d: string) =>
            new Date(d + "T00:00:00").toLocaleDateString("en-US", {
              month: "short",
              year: "2-digit",
            })
          }
        />
        <YAxis
          stroke="#27272a"
          tick={{ fill: "#52525b", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) =>
            `$${(v / 1000).toFixed(0)}k`
          }
          width={55}
        />
        <Tooltip
          contentStyle={{
            background: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "12px",
            color: "#fafafa",
            fontSize: "13px",
            padding: "10px 14px",
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
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "12px", color: "#71717a" }}
        />
        {personNames.map((name, i) => (
          <Area
            key={name}
            type="monotone"
            dataKey={name}
            stroke={COLORS[i % COLORS.length].stroke}
            fill={`url(#gradient-${i})`}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
