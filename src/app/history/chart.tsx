"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const PERSON_COLORS = [
  "#f59e0b",
  "#10b981",
  "#6366f1",
  "#f43f5e",
  "#8b5cf6",
];

const PLATFORM_COLORS = [
  "#f59e0b",
  "#10b981",
  "#6366f1",
  "#f43f5e",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#f97316",
  "#14b8a6",
];

type PlatformInfo = {
  data: Record<string, string | number>[];
  platforms: string[];
};

export function HistoryChart({
  personData,
  personNames,
  platformData,
}: {
  personData: Record<string, string | number>[];
  personNames: string[];
  platformData: Record<string, PlatformInfo>;
}) {
  const [selected, setSelected] = useState<string>("all");

  const { chartData, seriesNames, colors } = useMemo(() => {
    if (selected === "all" || !platformData[selected]) {
      return {
        chartData: personData,
        seriesNames: personNames,
        colors: PERSON_COLORS,
      };
    }
    const info = platformData[selected];
    return {
      chartData: info.data,
      seriesNames: info.platforms,
      colors: PLATFORM_COLORS,
    };
  }, [selected, personData, personNames, platformData]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 bg-zinc-900/60 rounded-lg p-0.5 border border-zinc-800/50 flex-wrap">
        <button
          onClick={() => setSelected("all")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            selected === "all"
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          All Members
        </button>
        {personNames.map((name) => (
          <button
            key={name}
            onClick={() =>
              setSelected(selected === name ? "all" : name)
            }
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              selected === name
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {selected !== "all" && (
        <p className="text-xs text-zinc-500">
          Showing platform breakdown for <span className="text-zinc-300 font-medium">{selected}</span>
        </p>
      )}

      <ResponsiveContainer width="100%" height={420}>
        <BarChart data={chartData}>
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
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
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
            iconType="square"
            iconSize={10}
            wrapperStyle={{ fontSize: "12px", color: "#71717a" }}
          />
          {seriesNames.map((name, i) => (
            <Bar
              key={name}
              dataKey={name}
              stackId="stack"
              fill={colors[i % colors.length]}
              radius={
                i === seriesNames.length - 1
                  ? [4, 4, 0, 0]
                  : [0, 0, 0, 0]
              }
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
